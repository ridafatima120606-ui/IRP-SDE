import { Request, Response } from "express";
import { PrismaClient, DemandLevel } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Pricing Controller
 * Implements dynamic pricing based on demand, time, and seasonal factors
 */

// Dynamic pricing algorithm
const calculateDynamicPrice = async (menuItemId: string, hour: number, dayOfWeek: number): Promise<number> => {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
  });

  if (!menuItem) {
    throw new Error("Menu item not found");
  }

  let basePrice = menuItem.price;
  let multiplier = 1.0;

  // Get applicable pricing rules
  const rules = await prisma.dynamicPrice.findMany({
    where: {
      menuItemId,
      status: "ACTIVE",
    },
  });

  // Apply matching rules
  for (const rule of rules) {
    // Check time range
    const [startHour, endHour] = rule.timeRange.split("-").map((t) => parseInt(t.split(":")[0]));

    // Check day of week (-1 means all days)
    const dayMatches = rule.dayOfWeek === -1 || rule.dayOfWeek === dayOfWeek;

    // Check time range
    const timeMatches = hour >= startHour && hour < endHour;

    if (dayMatches && timeMatches) {
      // Get demand level for current time
      const demandLevel = await getCurrentDemandLevel(hour);

      if (demandLevel === rule.demandLevel || (demandLevel === "HIGH" && rule.demandLevel === "HIGH")) {
        multiplier *= rule.priceMultiplier;
      }
    }
  }

  // Peak hour multipliers (if no rules found)
  if (multiplier === 1.0) {
    if (hour >= 12 && hour <= 14) multiplier *= 1.15; // Lunch rush
    if (hour >= 19 && hour <= 21) multiplier *= 1.25; // Dinner peak
  }

  // Weekend multiplier
  if (dayOfWeek === 5 || dayOfWeek === 6) multiplier *= 1.1;

  const finalPrice = basePrice * multiplier;

  // Apply min/max caps from rules if any
  const minRule = rules.find((r) => r.minPrice);
  const maxRule = rules.find((r) => r.maxPrice);

  let cappedPrice = finalPrice;
  if (minRule && minRule.minPrice) {
    cappedPrice = Math.max(cappedPrice, minRule.minPrice);
  }
  if (maxRule && maxRule.maxPrice) {
    cappedPrice = Math.min(cappedPrice, maxRule.maxPrice);
  }

  return Math.round(cappedPrice * 100) / 100; // Round to 2 decimals
};

// Get current demand level based on reservations and historical data
const getCurrentDemandLevel = async (hour: number): Promise<DemandLevel> => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check current reservations for this hour
  const startOfHour = new Date();
  startOfHour.setHours(hour, 0, 0, 0);
  const endOfHour = new Date();
  endOfHour.setHours(hour, 59, 59, 999);

  const currentReservations = await prisma.reservation.count({
    where: {
      reservationTime: {
        gte: startOfHour,
        lte: endOfHour,
      },
      status: "CONFIRMED",
    },
  });

  // Get table capacity
  const totalCapacity = await prisma.table.aggregate({
    _sum: {
      capacity: true,
    },
  });

  const capacity = totalCapacity._sum.capacity || 100;

  // Calculate occupancy percentage
  const occupancyPercent = (currentReservations * 2.5) / capacity; // Assume 2.5 people per reservation

  if (occupancyPercent > 0.85) return "PEAK";
  if (occupancyPercent > 0.65) return "HIGH";
  if (occupancyPercent > 0.35) return "MEDIUM";
  return "LOW";
};

/**
 * Get menu with dynamic prices
 * GET /api/v1/pricing/menu
 */
export const getDynamicMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    const menuItems = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        sustainability: true,
      },
    });

    // Calculate dynamic prices for each item
    const menuWithPrices = await Promise.all(
      menuItems.map(async (item) => {
        const dynamicPrice = await calculateDynamicPrice(item.id, hour, dayOfWeek);
        const surge = dynamicPrice > item.price ? Math.round((dynamicPrice / item.price - 1) * 100) : 0;
        
        return {
          ...item,
          basePrice: item.price,
          currentPrice: dynamicPrice,
          surgePercent: surge,
          isSurged: surge > 0,
        };
      })
    );

    // Group by category
    const grouped = menuWithPrices.reduce(
      (acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, any[]>
    );

    res.json({
      menu: grouped,
      demandLevel: await getCurrentDemandLevel(hour),
      hour,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching dynamic menu:", error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
};

/**
 * Get current price for an item
 * GET /api/v1/pricing/item/:id
 */
export const getItemPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) {
      res.status(404).json({ error: "Menu item not found" });
      return;
    }

    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    const dynamicPrice = await calculateDynamicPrice(id, hour, dayOfWeek);
    const demandLevel = await getCurrentDemandLevel(hour);

    res.json({
      itemId: id,
      name: menuItem.name,
      basePrice: menuItem.price,
      currentPrice: dynamicPrice,
      demandLevel,
      surgePercent: Math.round((dynamicPrice / menuItem.price - 1) * 100),
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching item price:", error);
    res.status(500).json({ error: "Failed to fetch price" });
  }
};

/**
 * Get 7-day demand forecast
 * GET /api/v1/pricing/forecast
 */
export const getDemandForecast = async (req: Request, res: Response): Promise<void> => {
  try {
    const forecast = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();

      // Simulate forecast (in production, this would use ML)
      const baselineOccupancy = 0.5;
      let predictedOccupancy = baselineOccupancy;

      // Friday and Saturday have higher demand
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        predictedOccupancy = baselineOccupancy * 1.5;
      }

      // Add some randomness for realism
      predictedOccupancy += (Math.random() - 0.5) * 0.2;

      forecast.push({
        date: date.toISOString().split("T")[0],
        dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek],
        predictedOccupancy: Math.min(Math.max(predictedOccupancy, 0), 1),
        suggestedPriceMultiplier: 1 + predictedOccupancy * 0.35,
        confidence: 0.75 + Math.random() * 0.2,
      });
    }

    res.json({
      forecast,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating forecast:", error);
    res.status(500).json({ error: "Failed to generate forecast" });
  }
};

/**
 * Create pricing rule (Admin only)
 * POST /api/v1/pricing/rules
 */
export const createPricingRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuItemId, timeRange, dayOfWeek, demandLevel, priceMultiplier, minPrice, maxPrice } = req.body;

    if (!menuItemId || !timeRange || !demandLevel || !priceMultiplier) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const rule = await prisma.dynamicPrice.create({
      data: {
        menuItemId,
        timeRange,
        dayOfWeek: dayOfWeek ?? -1,
        demandLevel,
        priceMultiplier,
        minPrice,
        maxPrice,
        status: "ACTIVE",
      },
      include: {
        menuItem: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Pricing rule created",
      rule,
    });
  } catch (error) {
    console.error("Error creating rule:", error);
    res.status(500).json({ error: "Failed to create rule" });
  }
};

/**
 * Get all pricing rules (Admin only)
 * GET /api/v1/pricing/rules
 */
export const getPricingRules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuItemId, status = "ACTIVE", limit = "50", offset = "0" } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (menuItemId) whereClause.menuItemId = menuItemId;

    const rules = await prisma.dynamicPrice.findMany({
      where: whereClause,
      include: {
        menuItem: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      skip: parseInt(offset as string),
      take: parseInt(limit as string),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.dynamicPrice.count({ where: whereClause });

    res.json({
      rules,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error("Error fetching rules:", error);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
};

/**
 * Update pricing rule (Admin only)
 * PUT /api/v1/pricing/rules/:id
 */
export const updatePricingRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { timeRange, dayOfWeek, demandLevel, priceMultiplier, minPrice, maxPrice, status } = req.body;

    const rule = await prisma.dynamicPrice.update({
      where: { id },
      data: {
        ...(timeRange && { timeRange }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(demandLevel && { demandLevel }),
        ...(priceMultiplier && { priceMultiplier }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(status && { status }),
      },
      include: {
        menuItem: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    });

    res.json({
      message: "Rule updated",
      rule,
    });
  } catch (error) {
    console.error("Error updating rule:", error);
    res.status(500).json({ error: "Failed to update rule" });
  }
};

/**
 * Delete pricing rule (Admin only)
 * DELETE /api/v1/pricing/rules/:id
 */
export const deletePricingRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.dynamicPrice.delete({
      where: { id },
    });

    res.json({
      message: "Rule deleted",
    });
  } catch (error) {
    console.error("Error deleting rule:", error);
    res.status(500).json({ error: "Failed to delete rule" });
  }
};

/**
 * Get pricing analytics (Admin only)
 * GET /api/v1/pricing/analytics
 */
export const getPricingAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get top items with surge pricing
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: {
        dynamicPrices: {
          where: { status: "ACTIVE" },
        },
      },
      take: 10,
    });

    // Calculate revenue impact
    let regularRevenue = 0;
    let surgedRevenue = 0;

    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    for (const item of items) {
      const dynamicPrice = await calculateDynamicPrice(item.id, hour, dayOfWeek);
      const surge = dynamicPrice - item.price;

      if (surge > 0) {
        surgedRevenue += surge;
      } else {
        regularRevenue += item.price;
      }
    }

    const totalRevenue = regularRevenue + surgedRevenue;
    const surgeContribution = totalRevenue > 0 ? (surgedRevenue / totalRevenue) * 100 : 0;

    res.json({
      totalItemsWithPricing: items.length,
      itemsWithSurge: items.filter((i) => i.dynamicPrices.length > 0).length,
      regularRevenue: Math.round(regularRevenue * 100) / 100,
      surgedRevenue: Math.round(surgedRevenue * 100) / 100,
      totalPotentialRevenue: Math.round(totalRevenue * 100) / 100,
      surgeContributionPercent: Math.round(surgeContribution * 100) / 100,
      currentDemandLevel: await getCurrentDemandLevel(hour),
      currentHour: hour,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
