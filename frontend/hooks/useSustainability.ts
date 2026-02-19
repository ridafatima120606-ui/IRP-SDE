'use client';

import { useCallback, useState } from 'react';
import apiClient from '@/utils/api';

interface SustainabilityScore {
  overallScore: number;
  carbonScore: number;
  vegetarianScore: number;
  localScore: number;
  organicScore: number;
  badges: any[];
  recommendation: string;
}

export const useSustainability = () => {
  const [sustainabilityScores, setSustainabilityScores] = useState<
    Map<string, SustainabilityScore>
  >(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSustainabilityScore = useCallback(
    async (menuItemId: string): Promise<SustainabilityScore | null> => {
      // Check cache first
      if (sustainabilityScores.has(menuItemId)) {
        return sustainabilityScores.get(menuItemId) || null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get(
          `/api/v1/sustainability/score/${menuItemId}`
        );

        const score = response.data;
        setSustainabilityScores(
          new Map(sustainabilityScores).set(menuItemId, score)
        );

        return score;
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Failed to fetch sustainability score'
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sustainabilityScores]
  );

  const getAllSustainabilityScores = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get(
          '/api/v1/sustainability/dishes'
        );

        const scores = new Map();
        response.data.forEach((item: any) => {
          scores.set(item.id, item.sustainability);
        });

        setSustainabilityScores(scores);
        return response.data;
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Failed to fetch sustainability data'
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getRestaurantMetrics = useCallback(
    async () => {
      try {
        const response = await apiClient.get(
          '/api/v1/sustainability/summary'
        );
        return response.data;
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Failed to fetch restaurant metrics'
        );
        throw err;
      }
    },
    []
  );

  const filterBySustainability = useCallback(
    async (minScore: number = 70) => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(
          `/api/v1/sustainability/filter?minScore=${minScore}`
        );
        return response.data;
      } catch (err: any) {
        setError('Failed to filter by sustainability');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    sustainabilityScores,
    isLoading,
    error,
    getSustainabilityScore,
    getAllSustainabilityScores,
    getRestaurantMetrics,
    filterBySustainability,
  };
};
