import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getLoyaltyProfile,
  getAvailableRewards,
  redeemReward,
  getLoyaltyHistory,
  generateReferralCode,
  useReferralCode,
  addPoints,
  createReward,
  getRewardsAdmin,
  deleteReward,
} from "../controllers/loyaltyController";

const router = Router();

/**
 * Customer Routes
 */

// Get loyalty profile
router.get("/profile", authenticate, getLoyaltyProfile);

// Get available rewards
router.get("/rewards", authenticate, getAvailableRewards);

// Redeem reward
router.post("/redeem/:rewardId", authenticate, redeemReward);

// Get points history
router.get("/history", authenticate, getLoyaltyHistory);

// Generate referral code
router.post("/referral/share", authenticate, generateReferralCode);

// Use referral code
router.post("/referral/use", authenticate, useReferralCode);

/**
 * Admin Routes
 */

// Add points manually
router.post("/points/add", authenticate, authorize("ADMIN"), addPoints);

// Create reward
router.post("/rewards/create", authenticate, authorize("ADMIN"), createReward);

// Get all rewards
router.get("/rewards/admin", authenticate, authorize("ADMIN"), getRewardsAdmin);

// Delete reward
router.delete("/rewards/:id", authenticate, authorize("ADMIN"), deleteReward);

export default router;
