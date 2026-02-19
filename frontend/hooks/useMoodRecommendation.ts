'use client';

import { useCallback, useState } from 'react';
import apiClient from '@/utils/api';

export const useMoodRecommendation = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMoodRecommendations = useCallback(
    async (moodId: string) => {
      try {
        setIsLoading(true);
        setError(null);
        setSelectedMood(moodId);

        const response = await apiClient.get(
          `/api/v1/moods/${moodId}/recommendations`
        );

        setRecommendations(response.data);
      } catch (err: any) {
        const message =
          err.response?.data?.message || 'Failed to fetch recommendations';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const setMoodPreference = useCallback(
    async (moodId: string, preferences: any) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.post(
          `/api/v1/moods/${moodId}/preferences`,
          preferences
        );

        setSelectedMood(moodId);
        return response.data;
      } catch (err: any) {
        const message =
          err.response?.data?.message || 'Failed to set mood preference';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getTableSuggestions = useCallback(
    async (moodId: string) => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(
          `/api/v1/moods/${moodId}/tables`
        );
        return response.data;
      } catch (err: any) {
        setError('Failed to fetch table suggestions');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    selectedMood,
    recommendations,
    isLoading,
    error,
    getMoodRecommendations,
    setMoodPreference,
    getTableSuggestions,
  };
};
