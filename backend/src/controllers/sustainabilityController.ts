import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import {
  calculateSustainabilityScore,
  calculateRestaurantSustainabilityMetrics,
  compareSustainability,
  filterBySustainability,
} from '@/algorithms/sustainabilityScore';

/**
 * Get Sustainability Score for Menu Item Controller
 */
export const getSustainabilityScore = async (req: Request, res: Response) => {
  try {
    const { menuItemId } = req.params;

    // Get menu item with sustainability metrics
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { sustainability: true },
    });

    if (!menuItem) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Menu item not found',
        timestamp: new Date().toISOString(),
      });
    }

    if (!menuItem.sustainability) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sustainability data not found for this item',
        timestamp: new Date().toISOString(),
      });
    }

    const sustainabilityData = {
      carbonFootprint: menuItem.sustainability.carbonFootprint,
      waterUsage: menuItem.sustainability.waterUsage,
      transportDistance: menuItem.sustainability.transportDistance,
      isLocalIngredient: menuItem.sustainability.isLocalIngredient,
      isOrganic: menuItem.sustainability.isOrganic,
      isVegan: menuItem.sustainability.isVegan,
      isVegetarian: menuItem.sustainability.isVegetarian,
      isSeasonal: menuItem.sustainability.isSeasonal,
      packagingType: menuItem.sustainability.packagingType,
    };

    const score = calculateSustainabilityScore(sustainabilityData);

    return res.status(200).json({
      status: 'OK',
      message: 'Sustainability score retrieved successfully',
      data: {
        menuItem: {
          id: menuItem.id,
          name: menuItem.name,
        },
        score,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get sustainability score error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve sustainability score',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get All Dishes with Sustainability Scores Controller
 */
export const getAllDishesWithScores = async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const menuItems = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { sustainability: true },
      take: parseInt(limit as string) || 50,
      skip: parseInt(offset as string) || 0,
    });

    const itemsWithScores = menuItems.map((item) => {
      if (!item.sustainability) {
        return { ...item, sustainability: null, score: null };
      }

      const sustainabilityData = {
        carbonFootprint: item.sustainability.carbonFootprint,
        waterUsage: item.sustainability.waterUsage,
        transportDistance: item.sustainability.transportDistance,
        isLocalIngredient: item.sustainability.isLocalIngredient,
        isOrganic: item.sustainability.isOrganic,
        isVegan: item.sustainability.isVegan,
        isVegetarian: item.sustainability.isVegetarian,
        isSeasonal: item.sustainability.isSeasonal,
        packagingType: item.sustainability.packagingType,
      };

      const score = calculateSustainabilityScore(sustainabilityData);

      return { ...item, score };
    });

    return res.status(200).json({
      status: 'OK',
      message: 'Dishes with sustainability scores retrieved successfully',
      data: itemsWithScores,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get dishes with scores error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve dishes',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get Restaurant Sustainability Summary Controller
 */
export const getRestaurantMetrics = async (req: Request, res: Response) => {
  try {
    // Get all menu items with sustainability
    const menuItems = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { sustainability: true },
    });

    // Filter items with sustainability data
    const itemsWithData = menuItems.filter(
      (item) => item.sustainability !== null
    ) as any[];

    if (itemsWithData.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'No sustainability data available',
        timestamp: new Date().toISOString(),
      });
    }

    const sustainabilityDataArray = itemsWithData.map((item) => ({
      id: item.id,
      carbonFootprint: item.sustainability.carbonFootprint,
      waterUsage: item.sustainability.waterUsage,
      transportDistance: item.sustainability.transportDistance,
      isLocalIngredient: item.sustainability.isLocalIngredient,
      isOrganic: item.sustainability.isOrganic,
      isVegan: item.sustainability.isVegan,
      isVegetarian: item.sustainability.isVegetarian,
      isSeasonal: item.sustainability.isSeasonal,
      packagingType: item.sustainability.packagingType,
    }));

    const metrics =
      calculateRestaurantSustainabilityMetrics(sustainabilityDataArray);

    return res.status(200).json({
      status: 'OK',
      message: 'Restaurant sustainability metrics retrieved successfully',
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get restaurant metrics error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve metrics',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Filter Dishes by Sustainability Score Controller
 */
export const filterBySustainabilityScore = async (
  req: Request,
  res: Response
) => {
  try {
    const { minScore = 70 } = req.query;
    const scoreThreshold = parseInt(minScore as string) || 70;

    // Get all available menu items
    const menuItems = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { sustainability: true },
    });

    // Filter items with sustainability data
    const itemsWithData = menuItems.filter(
      (item) => item.sustainability !== null
    ) as any[];

    // Filter by sustainability score
    const filteredItems = itemsWithData.filter((item) => {
      const sustainabilityData = {
        carbonFootprint: item.sustainability.carbonFootprint,
        waterUsage: item.sustainability.waterUsage,
        transportDistance: item.sustainability.transportDistance,
        isLocalIngredient: item.sustainability.isLocalIngredient,
        isOrganic: item.sustainability.isOrganic,
        isVegan: item.sustainability.isVegan,
        isVegetarian: item.sustainability.isVegetarian,
        isSeasonal: item.sustainability.isSeasonal,
        packagingType: item.sustainability.packagingType,
      };

      const score = calculateSustainabilityScore(sustainabilityData);
      return score.overallScore >= scoreThreshold;
    });

    return res.status(200).json({
      status: 'OK',
      message: `Dishes filtered by sustainability score (${scoreThreshold}+)`,
      data: {
        minScore: scoreThreshold,
        total: itemsWithData.length,
        filtered: filteredItems.length,
        items: filteredItems,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Filter by sustainability error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to filter dishes',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Add Sustainability Metrics Controller (Admin)
 */
export const addSustainabilityMetrics = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Access denied. Admin only',
        timestamp: new Date().toISOString(),
      });
    }

    const {
      menuItemId,
      carbonFootprint,
      waterUsage,
      transportDistance,
      isLocalIngredient,
      isOrganic,
      isVegan,
      isVegetarian,
      isSeasonal,
      packagingType,
    } = req.body;

    // Verify menu item exists
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Menu item not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Calculate sustainability score
    const sustainabilityData = {
      carbonFootprint,
      waterUsage,
      transportDistance,
      isLocalIngredient,
      isOrganic,
      isVegan,
      isVegetarian,
      isSeasonal,
      packagingType,
    };

    const score = calculateSustainabilityScore(sustainabilityData);

    // Create sustainability metrics
    const metrics = await prisma.sustainabilityMetrics.create({
      data: {
        menuItemId,
        carbonFootprint,
        waterUsage: waterUsage || null,
        transportDistance: transportDistance || null,
        isLocalIngredient: isLocalIngredient || false,
        isOrganic: isOrganic || false,
        isVegan: isVegan || false,
        isVegetarian: isVegetarian || false,
        isSeasonal: isSeasonal || false,
        packagingType: packagingType || null,
        sustainabilityScore: score.overallScore,
        badges: score.badges.map((b) => b.label),
      },
    });

    return res.status(201).json({
      status: 'OK',
      message: 'Sustainability metrics added successfully',
      data: {
        metrics,
        score,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Add sustainability metrics error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to add sustainability metrics',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Update Sustainability Metrics Controller (Admin)
 */
export const updateSustainabilityMetrics = async (
  req: Request,
  res: Response
) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Access denied. Admin only',
        timestamp: new Date().toISOString(),
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Get existing metrics
    const existingMetrics = await prisma.sustainabilityMetrics.findUnique({
      where: { id },
    });

    if (!existingMetrics) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sustainability metrics not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Recalculate score with updated data
    const sustainabilityData = {
      carbonFootprint:
        updates.carbonFootprint || existingMetrics.carbonFootprint,
      waterUsage: updates.waterUsage || existingMetrics.waterUsage,
      transportDistance:
        updates.transportDistance || existingMetrics.transportDistance,
      isLocalIngredient:
        updates.isLocalIngredient !== undefined
          ? updates.isLocalIngredient
          : existingMetrics.isLocalIngredient,
      isOrganic:
        updates.isOrganic !== undefined
          ? updates.isOrganic
          : existingMetrics.isOrganic,
      isVegan:
        updates.isVegan !== undefined ? updates.isVegan : existingMetrics.isVegan,
      isVegetarian:
        updates.isVegetarian !== undefined
          ? updates.isVegetarian
          : existingMetrics.isVegetarian,
      isSeasonal:
        updates.isSeasonal !== undefined
          ? updates.isSeasonal
          : existingMetrics.isSeasonal,
      packagingType:
        updates.packagingType || existingMetrics.packagingType,
    };

    const score = calculateSustainabilityScore(sustainabilityData);

    // Update metrics
    const updatedMetrics = await prisma.sustainabilityMetrics.update({
      where: { id },
      data: {
        ...updates,
        sustainabilityScore: score.overallScore,
        badges: score.badges.map((b) => b.label),
      },
    });

    return res.status(200).json({
      status: 'OK',
      message: 'Sustainability metrics updated successfully',
      data: {
        metrics: updatedMetrics,
        score,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Update sustainability metrics error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update sustainability metrics',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
