import { useState, useCallback } from 'react';
import { loyaltyService } from '@/services/phase11Service';
import { LoyaltyProfile, Reward } from '@/types/phase11';

export const useLoyalty = (token: string | null) => {
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getProfile = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const result = await loyaltyService.getProfile(token);
      setProfile(result);
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getAvailableRewards = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      return null;
    }

    setLoading(true);

    try {
      const result = await loyaltyService.getAvailableRewards(token);
      setRewards(result);
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load rewards';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const redeemReward = useCallback(
    async (rewardId: string) => {
      if (!token) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);

      try {
        const result = await loyaltyService.redeemReward(rewardId, token);
        // Refresh profile after redemption
        await getProfile();
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to redeem reward';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, getProfile]
  );

  const getHistory = useCallback(
    async (page = 1) => {
      if (!token) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);

      try {
        const result = await loyaltyService.getHistory(page, token);
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to load history';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const generateReferralCode = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      return null;
    }

    setLoading(true);

    try {
      const result = await loyaltyService.generateReferralCode(token);
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to generate code';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const useReferralCode = useCallback(
    async (code: string) => {
      if (!token) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);

      try {
        const result = await loyaltyService.useReferralCode(code, token);
        // Refresh profile
        await getProfile();
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to use code';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, getProfile]
  );

  const clearError = useCallback(() => setError(''), []);

  return {
    profile,
    rewards,
    loading,
    error,
    getProfile,
    getAvailableRewards,
    redeemReward,
    getHistory,
    generateReferralCode,
    useReferralCode,
    clearError,
  };
};
