import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import {
  getAllMoods,
  getMood,
  generateMoodRecommendation,
} from '@/algorithms/moodBasedRecommendation';

/**
 * Get All Moods Controller
 */
export const getAllMoodsController = async (req: Request, res: Response) => {
  try {
    const moods = getAllMoods();

    return res.status(200).json({
      status: 'OK',
      message: 'Moods retrieved successfully',
      data: moods,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get moods error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve moods',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get Mood Recommendations Controller
 */
export const getMoodRecommendations = async (req: Request, res: Response) => {
  try {
    const { id: moodId } = req.params;

    // Validate mood
    const mood = getMood(moodId);
    if (!mood) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Mood not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Get available menu items
    const menuItems = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { sustainability: true },
    });

    // Get available tables
    const availableTables = await prisma.table.findMany({
      where: { status: 'AVAILABLE' },
    });

    // Generate recommendation
    const recommendation = generateMoodRecommendation(
      moodId,
      menuItems,
      availableTables
    );

    if (!recommendation) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Failed to generate recommendation',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Mood recommendations generated successfully',
      data: recommendation,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get mood recommendations error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get recommendations',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Set Mood Preference Controller
 */
export const setMoodPreference = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
    }

    const { id: moodId } = req.params;
    const { preferredTableType, lightingPreference, musicPreference } = req.body;

    // Validate mood
    const mood = getMood(moodId);
    if (!mood) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Mood not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Create or update mood preference
    const moodPreference = await prisma.moodPreference.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        currentMood: moodId,
        preferredTableType: preferredTableType || mood.suggestedTableType,
        lightingPreference: lightingPreference || mood.lighting,
        musicPreference: musicPreference || mood.musicGenre,
      },
      update: {
        currentMood: moodId,
        preferredTableType: preferredTableType || mood.suggestedTableType,
        lightingPreference: lightingPreference || mood.lighting,
        musicPreference: musicPreference || mood.musicGenre,
      },
    });

    return res.status(200).json({
      status: 'OK',
      message: 'Mood preference set successfully',
      data: moodPreference,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Set mood preference error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to set mood preference',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get Menu Items for Mood Controller
 */
export const getMenuForMood = async (req: Request, res: Response) => {
  try {
    const { id: moodId } = req.params;
    const { limit = 10 } = req.query;

    // Validate mood
    const mood = getMood(moodId);
    if (!mood) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Mood not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Get menu items with mood tags
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        moodTags: {
          hasSome: [moodId],
        },
      },
      include: { sustainability: true },
      take: parseInt(limit as string) || 10,
    });

    return res.status(200).json({
      status: 'OK',
      message: 'Menu items for mood retrieved successfully',
      data: menuItems,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get menu for mood error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve menu',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get Tables for Mood Controller
 */
export const getTablesForMood = async (req: Request, res: Response) => {
  try {
    const { id: moodId } = req.params;

    // Validate mood
    const mood = getMood(moodId);
    if (!mood) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Mood not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Get available tables suitable for mood
    const tables = await prisma.table.findMany({
      where: {
        status: 'AVAILABLE',
        ambiance: {
          contains: moodId,
          mode: 'insensitive',
        },
      },
      orderBy: { capacity: 'asc' },
    });

    return res.status(200).json({
      status: 'OK',
      message: 'Tables for mood retrieved successfully',
      data: {
        mood: mood.name,
        suggestedTableType: mood.suggestedTableType,
        tables,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get tables for mood error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve tables',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get User Mood Preference Controller
 */
export const getUserMoodPreference = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
    }

    const moodPreference = await prisma.moodPreference.findUnique({
      where: { userId: req.user.id },
    });

    if (!moodPreference) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'No mood preference found',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'User mood preference retrieved successfully',
      data: moodPreference,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get user mood preference error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve mood preference',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
