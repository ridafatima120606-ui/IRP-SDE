import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Loyalty Controller
 * Manages customer loyalty points and rewards
 */

// Point earning rules
const EARNING_RULES = {
  ORDER: 1, // 1 point per $1 spent
  REFERRAL: 50,
  REVIEW: 25,
  BIRTHDAY: 100,
  TIER_UPGRADE: 500,
};

// Tier thresholds
const TIER_THRESHOLDS = {
  SILVER: 0,
  GOLD: 500,
  PLATINUM: 2000,
};

// Tier benefits multiplier
const TIER_MULTIPLIERS = {
  SILVER: 1,
  GOLD: 1.5,
  PLATINUM: 2,
};

// Calculate tier based on loyalty points
const calculateTier = (points: number): string => {
  if (points >= TIER_THRESHOLDS.PLATINUM) return "PLATINUM";
  if (points >= TIER_THRESHOLDS.GOLD) return "GOLD";
  return "SILVER";
};

/**
 * Get user loyalty profile
 * GET /api/v1/loyalty/profile
 */
export const getLoyaltyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    let loyaltyPoints = await prisma.loyaltyPoints.findUnique({
      where: { userId },
    });

    // Create if doesn't exist
    if (!loyaltyPoints) {
      loyaltyPoints = await prisma.loyaltyPoints.create({
        data: {
          userId,
          points: 0,
          tier: "SILVER"
        },
      });
    }

    // Calculate tier progression
    const currentTierThreshold = calculateTier(loyaltyPoints.points) as keyof typeof TIER_THRESHOLDS;
    const currentThreshold = TIER_THRESHOLDS[currentTierThreshold];
    const nextTierName = currentTierThreshold === "PLATINUM" ? null : 
                         currentTierThreshold === "GOLD" ? "PLATINUM" : "GOLD";
    const nextThreshold = nextTierName ? TIER_THRESHOLDS[nextTierName as keyof typeof TIER_THRESHOLDS] : null;
    const pointsToNextTier = nextThreshold ? nextThreshold - loyaltyPoints.points : null;

    res.json({
      points: loyaltyPoints.points,
      tier: loyaltyPoints.tier,
      tierProgression: {
        current: currentTierThreshold,
        next: nextTierName,
        pointsToNextTier,
        progressPercent: nextThreshold ? 
          Math.min(100, ((loyaltyPoints.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100) : 100,
      },
      benefits: {
        pointMultiplier: TIER_MULTIPLIERS[currentTierThreshold as keyof typeof TIER_MULTIPLIERS],
        rewardsAvailable: loyaltyPoints.points > 0,
      },
      createdAt: loyaltyPoints.createdAt,
      updatedAt: loyaltyPoints.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching loyalty profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

/**
 * Get available rewards
 * GET /api/v1/loyalty/rewards
 */
export const getAvailableRewards = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { tier, limit = "20" } = req.query;

    const loyaltyPoints = await prisma.loyaltyPoints.findUnique({
      where: { userId },
    });

    const rewards = await prisma.rewardCatalog.findMany({
      where: {
        status: "ACTIVE",
        validUntil: {
          gt: new Date(),
        },
        ...(tier && { /* Filter by tier if needed */ }),
      },
      take: parseInt(limit as string),
      orderBy: {
        pointsCost: "asc",
      },
    });

    // Add availability and affordability info
    const enrichedRewards = rewards.map((reward) => {
      const canRedeem = (loyaltyPoints?.points ?? 0) >= reward.pointsCost;
      const available = !reward.totalLimit || reward.claimCount < reward.totalLimit;

      return {
        ...reward,
        canRedeem,
        available,
        daysUntilExpiry: Math.ceil((reward.validUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      };
    });

    res.json({
      rewards: enrichedRewards,
      userPoints: loyaltyPoints?.points ?? 0,
      userTier: loyaltyPoints?.tier ?? "SILVER",
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ error: "Failed to fetch rewards" });
  }
};

/**
 * Redeem a reward
 * POST /api/v1/loyalty/redeem/:rewardId
 */
export const redeemReward = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { rewardId } = req.params;

    // Get user loyalty points
    let loyaltyPoints = await prisma.loyaltyPoints.findUnique({
      where: { userId },
    });

    if (!loyaltyPoints) {
      loyaltyPoints = await prisma.loyaltyPoints.create({
        data: {
          userId,
          points: 0,
          tier: "SILVER",
        },
      });
    }

    // Get reward
    const reward = await prisma.rewardCatalog.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      res.status(404).json({ error: "Reward not found" });
      return;
    }

    // Check if reward is available
    if (reward.status !== "ACTIVE" || reward.validUntil < new Date()) {
      res.status(400).json({ error: "Reward is no longer available" });
      return;
    }

    // Check total limit
    if (reward.totalLimit && reward.claimCount >= reward.totalLimit) {
      res.status(400).json({ error: "Reward limit exceeded" });
      return;
    }

    // Check user limit
    const userRedemptions = await prisma.rewardRedemption.count({
      where: {
        userId,
        rewardId,
        status: "REDEEMED",
      },
    });

    if (userRedemptions >= reward.perUserLimit) {
      res.status(400).json({ error: "You have reached the redemption limit for this reward" });
      return;
    }

    // Check points balance
    if (loyaltyPoints.points < reward.pointsCost) {
      res.status(400).json({ 
        error: "Insufficient points",
        pointsNeeded: reward.pointsCost - loyaltyPoints.points,
      });
      return;
    }

    // Create redemption record
    const redemption = await prisma.rewardRedemption.create({
      data: {
        userId,
        rewardId,
        pointsSpent: reward.pointsCost,
        status: "REDEEMED",
      },
    });

    // Deduct points
    loyaltyPoints = await prisma.loyaltyPoints.update({
      where: { userId },
      data: {
        points: {
          decrement: reward.pointsCost,
        },
      },
    });

    // Update reward claim count
    await prisma.rewardCatalog.update({
      where: { id: rewardId },
      data: {
        claimCount: {
          increment: 1,
        },
      },
    });

    // Update tier if needed
    const newTier = calculateTier(loyaltyPoints.points);
    if (newTier !== loyaltyPoints.tier) {
      await prisma.loyaltyPoints.update({
        where: { userId },
        data: { tier: newTier },
      });
    }

    res.json({
      message: "Reward redeemed successfully",
      redemption,
      pointsRemaining: loyaltyPoints.points,
      reward: {
        name: reward.name,
        discount: reward.discount,
        freeItem: reward.freeItem,
      },
    });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    res.status(500).json({ error: "Failed to redeem reward" });
  }
};

/**
 * Get loyalty points history
 * GET /api/v1/loyalty/history
 */
export const getLoyaltyHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { limit = "50", offset = "0" } = req.query;

    const redemptions = await prisma.rewardRedemption.findMany({
      where: { userId },
      include: {
        reward: {
          select: {
            name: true,
            pointsCost: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: parseInt(offset as string),
      take: parseInt(limit as string),
    });

    const total = await prisma.rewardRedemption.count({
      where: { userId },
    });

    // Calculate summary
    const totalPointsEarned = 0; // Would need separate points earning table
    const totalPointsSpent = redemptions.reduce((sum, r) => sum + r.pointsSpent, 0);

    res.json({
      history: redemptions,
      summary: {
        totalPointsEarned,
        totalPointsSpent,
        totalRewards: total,
      },
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

/**
 * Generate referral code
 * POST /api/v1/loyalty/referral/share
 */
export const generateReferralCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    // Generate unique code
    const code = `REF-${userId.substring(0, 6)}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    res.json({
      referralCode: code,
      referralLink: `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/register?ref=${code}`,
      bonusPoints: EARNING_RULES.REFERRAL,
      message: "Share this code with friends to earn points",
    });
  } catch (error) {
    console.error("Error generating referral code:", error);
    res.status(500).json({ error: "Failed to generate code" });
  }
};

/**
 * Use referral code
 * POST /api/v1/loyalty/referral/use
 */
export const useReferralCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { referralCode } = req.body;

    if (!referralCode) {
      res.status(400).json({ error: "Referral code is required" });
      return;
    }

    // In a real implementation, you'd validate the referral code
    // For now, we'll just award points to both users

    // Award points to new user
    let loyaltyPoints = await prisma.loyaltyPoints.findUnique({
      where: { userId },
    });

    if (!loyaltyPoints) {
      loyaltyPoints = await prisma.loyaltyPoints.create({
        data: {
          userId,
          points: EARNING_RULES.REFERRAL,
          tier: "SILVER",
        },
      });
    } else {
      loyaltyPoints = await prisma.loyaltyPoints.update({
        where: { userId },
        data: {
          points: {
            increment: EARNING_RULES.REFERRAL,
          },
        },
      });
    }

    res.json({
      message: "Referral code applied successfully",
      pointsEarned: EARNING_RULES.REFERRAL,
      totalPoints: loyaltyPoints.points,
    });
  } catch (error) {
    console.error("Error using referral code:", error);
    res.status(500).json({ error: "Failed to apply code" });
  }
};

/**
 * Add points manually (Admin only)
 * POST /api/v1/loyalty/points/add
 */
export const addPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, points, reason } = req.body;

    if (!userId || !points) {
      res.status(400).json({ error: "userId and points are required" });
      return;
    }

    let loyaltyPoints = await prisma.loyaltyPoints.findUnique({
      where: { userId },
    });

    if (!loyaltyPoints) {
      loyaltyPoints = await prisma.loyaltyPoints.create({
        data: {
          userId,
          points,
          tier: "SILVER",
        },
      });
    } else {
      loyaltyPoints = await prisma.loyaltyPoints.update({
        where: { userId },
        data: {
          points: {
            increment: points,
          },
        },
      });
    }

    // Update tier if needed
    const newTier = calculateTier(loyaltyPoints.points);
    if (newTier !== loyaltyPoints.tier) {
      await prisma.loyaltyPoints.update({
        where: { userId },
        data: { tier: newTier },
      });
    }

    res.json({
      message: "Points added successfully",
      pointsAdded: points,
      reason,
      totalPoints: loyaltyPoints.points,
      tier: newTier,
    });
  } catch (error) {
    console.error("Error adding points:", error);
    res.status(500).json({ error: "Failed to add points" });
  }
};

/**
 * Create reward (Admin only)
 * POST /api/v1/loyalty/rewards/create
 */
export const createReward = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, pointsCost, discount, freeItem, validUntil, totalLimit, perUserLimit } = req.body;

    if (!name || !pointsCost || !validUntil) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const reward = await prisma.rewardCatalog.create({
      data: {
        name,
        description,
        pointsCost,
        discount,
        freeItem,
        validUntil: new Date(validUntil),
        totalLimit,
        perUserLimit: perUserLimit || 1,
        status: "ACTIVE",
      },
    });

    res.status(201).json({
      message: "Reward created",
      reward,
    });
  } catch (error) {
    console.error("Error creating reward:", error);
    res.status(500).json({ error: "Failed to create reward" });
  }
};

/**
 * Get all rewards (Admin only)
 * GET /api/v1/loyalty/rewards/admin
 */
export const getRewardsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, limit = "50", offset = "0" } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = status;

    const rewards = await prisma.rewardCatalog.findMany({
      where: whereClause,
      skip: parseInt(offset as string),
      take: parseInt(limit as string),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.rewardCatalog.count({ where: whereClause });

    res.json({
      rewards,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ error: "Failed to fetch rewards" });
  }
};

/**
 * Delete reward (Admin only)
 * DELETE /api/v1/loyalty/rewards/:id
 */
export const deleteReward = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.rewardCatalog.delete({
      where: { id },
    });

    res.json({
      message: "Reward deleted",
    });
  } catch (error) {
    console.error("Error deleting reward:", error);
    res.status(500).json({ error: "Failed to delete reward" });
  }
};
