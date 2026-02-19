/**
 * Sustainability Score Calculator
 * Calculates eco-friendly metrics for menu items
 */

export interface Badge {
  icon: string;
  label: string;
  description: string;
}

export const SUSTAINABILITY_BADGES = {
  VEGAN: {
    icon: '🌱',
    label: 'Vegan',
    description: 'No animal products',
  },
  VEGETARIAN: {
    icon: '🥬',
    label: 'Vegetarian',
    description: 'No meat',
  },
  LOCAL: {
    icon: '🌍',
    label: 'Local',
    description: 'Made with locally sourced ingredients',
  },
  ORGANIC: {
    icon: '🍃',
    label: 'Organic',
    description: 'No synthetic pesticides or fertilizers',
  },
  CARBON_NEUTRAL: {
    icon: '♻️',
    label: 'Carbon Neutral',
    description: 'Offset carbon emissions',
  },
  ECO_PACKAGING: {
    icon: '📦',
    label: 'Eco Packaging',
    description: 'Recyclable or compostable packaging',
  },
  FAIR_TRADE: {
    icon: '🤝',
    label: 'Fair Trade',
    description: 'Fair wages and ethical sourcing',
  },
  SEASONAL: {
    icon: '🌾',
    label: 'Seasonal',
    description: 'In-season ingredients',
  },
  LOW_CARBON: {
    icon: '💨',
    label: 'Low Carbon',
    description: 'Low carbon footprint',
  },
};

interface SustainabilityData {
  carbonFootprint: number; // kg CO2
  waterUsage?: number; // liters
  transportDistance?: number; // km
  isLocalIngredient: boolean;
  isOrganic: boolean;
  isVegan: boolean;
  isVegetarian: boolean;
  isSeasonal: boolean;
  packagingType?: string;
}

interface SustainabilityScore {
  overallScore: number; // 0-100
  carbonScore: number; // 0-100
  vegetarianScore: number; // 0-100
  localScore: number; // 0-100
  organicScore: number; // 0-100
  badges: Badge[];
  recommendation: string;
}

/**
 * Calculate carbon score (lower is better)
 * Typical dish: 1-3 kg CO2
 * Low carbon: < 0.5 kg CO2
 * High carbon: > 5 kg CO2
 */
export const calculateCarbonScore = (
  carbonFootprint: number
): number => {
  if (!carbonFootprint || carbonFootprint < 0) return 0;

  // Use inverse scoring: less carbon = higher score
  const maxCarbon = 10; // kg CO2
  const score = Math.max(0, 100 - (carbonFootprint / maxCarbon) * 100);

  return Math.round(score);
};

/**
 * Calculate vegetarian/vegan score
 */
export const calculateVegetarianScore = (
  isVegan: boolean,
  isVegetarian: boolean
): number => {
  if (isVegan) return 100;
  if (isVegetarian) return 75;
  return 0;
};

/**
 * Calculate local sourcing score
 */
export const calculateLocalScore = (
  isLocalIngredient: boolean,
  transportDistance?: number
): number => {
  if (!isLocalIngredient && !transportDistance) return 0;

  if (isLocalIngredient) {
    // Local ingredients get base score
    return 80;
  }

  // Score based on transport distance
  if (transportDistance && transportDistance > 0) {
    // Less than 100km = high score
    // 100-500km = medium score
    // > 500km = low score
    if (transportDistance < 100) return 70;
    if (transportDistance < 500) return 40;
    return 10;
  }

  return 50; // Default if mixed sources
};

/**
 * Calculate organic/quality score
 */
export const calculateOrganicScore = (
  isOrganic: boolean,
  isSeasonal: boolean
): number => {
  let score = 0;

  if (isOrganic) score += 50;
  if (isSeasonal) score += 50;

  return score;
};

/**
 * Get sustainability badges for item
 */
export const getSustainabilityBadges = (
  data: SustainabilityData
): Badge[] => {
  const badges: Badge[] = [];

  if (data.isVegan) {
    badges.push(SUSTAINABILITY_BADGES.VEGAN);
  } else if (data.isVegetarian) {
    badges.push(SUSTAINABILITY_BADGES.VEGETARIAN);
  }

  if (data.isLocalIngredient) {
    badges.push(SUSTAINABILITY_BADGES.LOCAL);
  }

  if (data.isOrganic) {
    badges.push(SUSTAINABILITY_BADGES.ORGANIC);
  }

  if (data.isSeasonal) {
    badges.push(SUSTAINABILITY_BADGES.SEASONAL);
  }

  // Carbon neutral badge
  if (data.carbonFootprint && data.carbonFootprint < 0.5) {
    badges.push(SUSTAINABILITY_BADGES.LOW_CARBON);
  }

  // Packaging badge
  if (
    data.packagingType &&
    (data.packagingType.includes('Recyclable') ||
      data.packagingType.includes('Compostable'))
  ) {
    badges.push(SUSTAINABILITY_BADGES.ECO_PACKAGING);
  }

  return badges;
};

/**
 * Get sustainability recommendation
 */
export const getSustainabilityRecommendation = (
  score: number
): string => {
  if (score >= 85) {
    return '🌟 Highly sustainable choice!';
  }
  if (score >= 70) {
    return '✅ Good sustainable option';
  }
  if (score >= 50) {
    return '⚠️ Moderate environmental impact';
  }
  return '❌ Consider more eco-friendly alternatives';
};

/**
 * Calculate overall sustainability score
 */
export const calculateSustainabilityScore = (
  data: SustainabilityData
): SustainabilityScore => {
  const carbonScore = calculateCarbonScore(data.carbonFootprint);
  const vegetarianScore = calculateVegetarianScore(
    data.isVegan,
    data.isVegetarian
  );
  const localScore = calculateLocalScore(
    data.isLocalIngredient,
    data.transportDistance
  );
  const organicScore = calculateOrganicScore(
    data.isOrganic,
    data.isSeasonal
  );

  // Weighted overall score
  const overallScore = Math.round(
    (carbonScore * 0.3 +
      vegetarianScore * 0.25 +
      localScore * 0.25 +
      organicScore * 0.2) /
    1
  );

  const badges = getSustainabilityBadges(data);
  const recommendation = getSustainabilityRecommendation(overallScore);

  return {
    overallScore: Math.min(overallScore, 100),
    carbonScore,
    vegetarianScore,
    localScore,
    organicScore,
    badges,
    recommendation,
  };
};

/**
 * Compare sustainability of multiple items
 */
export const compareSustainability = (
  items: (SustainabilityData & { id: string; name: string })[]
): Array<{
  id: string;
  name: string;
  score: SustainabilityScore;
}> => {
  return items
    .map((item) => ({
      id: item.id,
      name: item.name,
      score: calculateSustainabilityScore(item),
    }))
    .sort((a, b) => b.score.overallScore - a.score.overallScore);
};

/**
 * Filter dishes by sustainability level
 */
export const filterBySustainability = (
  items: (SustainabilityData & { id: string })[] ,
  minScore: number = 70
): string[] => {
  return items
    .filter((item) => {
      const score = calculateSustainabilityScore(item);
      return score.overallScore >= minScore;
    })
    .map((item) => item.id);
};

/**
 * Get restaurant sustainability metrics
 */
export const calculateRestaurantSustainabilityMetrics = (
  allDishes: (SustainabilityData & { id: string })[]
) => {
  const scores = allDishes.map((dish) =>
    calculateSustainabilityScore(dish)
  );

  const avgScore =
    scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length;

  const veganCount = allDishes.filter((d) => d.isVegan).length;
  const vegetarianCount = allDishes.filter((d) => d.isVegetarian).length;
  const localCount = allDishes.filter((d) => d.isLocalIngredient).length;
  const organicCount = allDishes.filter((d) => d.isOrganic).length;

  const totalCarbonFootprint = allDishes.reduce(
    (sum, d) => sum + (d.carbonFootprint || 0),
    0
  );

  return {
    averageSustainabilityScore: Math.round(avgScore),
    totalDishes: allDishes.length,
    veganOptions: veganCount,
    vegetarianOptions: vegetarianCount,
    localSourcedDishes: localCount,
    organicDishes: organicCount,
    totalCarbonFootprint: totalCarbonFootprint.toFixed(2),
    recommendationLevel: getSustainabilityRecommendation(Math.round(avgScore)),
  };
};
