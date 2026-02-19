import { MenuItem } from '@prisma/client';

/**
 * Mood-Based Recommendation Engine
 * Recommends dishes and table settings based on customer mood
 */

export interface MoodCategory {
  id: string;
  name: 'ROMANTIC' | 'FAMILY' | 'BUSINESS' | 'BIRTHDAY';
  characteristics: string[];
  suggestedTableType: string;
  lighting: string;
  musicGenre: string;
  dishPreferences: string[];
}

const moods: Record<string, MoodCategory> = {
  ROMANTIC: {
    id: 'romantic',
    name: 'ROMANTIC',
    characteristics: ['intimate', 'cozy', 'elegant', 'quiet'],
    suggestedTableType: 'Window or Corner',
    lighting: 'Dim',
    musicGenre: 'Jazz/Classical',
    dishPreferences: ['seafood', 'pasta', 'wine-paired', 'desserts'],
  },
  FAMILY: {
    id: 'family',
    name: 'FAMILY',
    characteristics: ['fun', 'casual', 'interactive', 'diverse'],
    suggestedTableType: 'Center or Large Table',
    lighting: 'Bright',
    musicGenre: 'Pop/Upbeat',
    dishPreferences: ['comfort-food', 'kid-friendly', 'shareable', 'variety'],
  },
  BUSINESS: {
    id: 'business',
    name: 'BUSINESS',
    characteristics: ['professional', 'quiet', 'convenient', 'impressive'],
    suggestedTableType: 'Private Booth',
    lighting: 'Moderate',
    musicGenre: 'Background/Ambient',
    dishPreferences: ['premium', 'sophisticated', 'quick-service', 'healthy'],
  },
  BIRTHDAY: {
    id: 'birthday',
    name: 'BIRTHDAY',
    characteristics: ['celebratory', 'festive', 'special', 'memorable'],
    suggestedTableType: 'Center or Private',
    lighting: 'Bright',
    musicGenre: 'Upbeat/Party',
    dishPreferences: ['special-dishes', 'desserts', 'sharing-plates', 'seasonal'],
  },
};

interface MoodRecommendation {
  mood: MoodCategory;
  recommendedDishes: any[];
  suggestedTables: any[];
  ambiance: {
    lighting: string;
    musicGenre: string;
    tableType: string;
  };
  estimatedCost: number;
}

/**
 * Get mood by name
 */
export const getMood = (moodName: string): MoodCategory | null => {
  const mood = Object.values(moods).find(
    (m) => m.name === moodName.toUpperCase()
  );
  return mood || null;
};

/**
 * Score dishes based on mood
 */
export const scoreDishForMood = (
  dish: any,
  moodName: string
): number => {
  const mood = getMood(moodName);
  if (!mood) return 0;

  let score = 0;

  // Check if dish has mood tags
  if (dish.moodTags && Array.isArray(dish.moodTags)) {
    const moodLowerName = moodName.toLowerCase();
    if (
      dish.moodTags.some((tag: string) =>
        tag.toLowerCase().includes(moodLowerName)
      )
    ) {
      score += 50;
    }
  }

  // Check dish category against mood preferences
  if (mood.dishPreferences.includes(dish.category?.toLowerCase())) {
    score += 30;
  }

  // Price-based scoring
  if (dish.price > 0) {
    // Premium pricing for romantic and business moods
    if ((moodName === 'ROMANTIC' || moodName === 'BUSINESS') && dish.price > 15) {
      score += 10;
    }
    // Budget-friendly for family mood
    if (moodName === 'FAMILY' && dish.price < 10) {
      score += 10;
    }
  }

  // Preparation time bonus for moods where time matters
  if (dish.prepTime && dish.prepTime < 30 && moodName === 'BUSINESS') {
    score += 10;
  }

  return Math.min(score, 100);
};

/**
 * Get menu recommendations for a mood
 */
export const getMenuRecommendations = (
  menuItems: any[],
  moodName: string,
  limit: number = 10
): any[] => {
  const scored = menuItems
    .filter((item) => item.isAvailable)
    .map((item) => ({
      ...item,
      moodScore: scoreDishForMood(item, moodName),
    }))
    .sort((a, b) => b.moodScore - a.moodScore);

  return scored.slice(0, limit);
};

/**
 * Generate complete mood recommendation
 */
export const generateMoodRecommendation = (
  moodName: string,
  menuItems: any[],
  availableTables: any[]
): MoodRecommendation | null => {
  const mood = getMood(moodName);
  if (!mood) return null;

  const recommendedDishes = getMenuRecommendations(menuItems, moodName, 8);

  const suggestedTables = availableTables
    .filter((table) =>
      table.ambiance
        ?.toLowerCase()
        .includes(moodName.toLowerCase())
    )
    .sort((a, b) => a.capacity - b.capacity)
    .slice(0, 3);

  const estimatedCost = recommendedDishes.reduce(
    (sum, dish) => sum + dish.price,
    0
  ) / recommendedDishes.length;

  return {
    mood,
    recommendedDishes,
    suggestedTables,
    ambiance: {
      lighting: mood.lighting,
      musicGenre: mood.musicGenre,
      tableType: mood.suggestedTableType,
    },
    estimatedCost,
  };
};

/**
 * Get all mood categories
 */
export const getAllMoods = (): MoodCategory[] => {
  return Object.values(moods);
};
