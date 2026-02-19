'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { loyaltyService } from '@/services/phase11Service';
import { Reward } from '@/types/phase11';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Gift, Zap, Lock } from 'lucide-react';

export default function RewardsShop() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  const fetchRewards = async () => {
    if (!token) return;

    try {
      const data = await loyaltyService.getAvailableRewards(token);
      if (Array.isArray(data)) {
        setRewards(data);
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [token]);

  const handleRedeem = async (rewardId: string) => {
    if (!token) return;

    setRedeeming(rewardId);
    try {
      const result = await loyaltyService.redeemReward(rewardId, token);
      setUserPoints(result.pointsRemaining);
      setRewards(rewards.filter((r) => r.id !== rewardId));
      // Optional: Show success toast
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem reward');
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Points */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Rewards Shop</h2>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <Zap className="w-5 h-5 text-yellow-600" />
          <span className="font-bold">{userPoints}</span>
          <span className="text-sm text-gray-600">points</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Rewards Grid */}
      {rewards.length === 0 ? (
        <Card className="p-8 text-center">
          <Gift className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
          <p className="text-gray-600 font-medium">No rewards available</p>
          <p className="text-sm text-gray-500 mt-1">Check back later for new rewards</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const isAffordable = userPoints >= reward.pointsCost;
            const isSoldOut = !reward.available;

            return (
              <Card
                key={reward.id}
                className={`p-4 relative overflow-hidden ${
                  !isAffordable || isSoldOut ? 'opacity-60' : ''
                }`}
              >
                {/* Sold Out Badge */}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      SOLD OUT
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Name and Description */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg">{reward.name}</h3>
                      {reward.discount && (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                          {reward.discount}% OFF
                        </span>
                      )}
                    </div>
                    {reward.description && (
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    )}
                  </div>

                  {/* Points Cost */}
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">Cost</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      {reward.pointsCost}
                      <Zap className="w-5 h-5 text-yellow-600" />
                    </p>
                  </div>

                  {/* Availability Info */}
                  <div className="text-xs text-gray-500 space-y-1">
                    {reward.totalLimit && (
                      <p>Only {Math.max(0, reward.totalLimit - reward.claimCount)} left</p>
                    )}
                    {reward.daysUntilExpiry !== undefined && (
                      <p>
                        Expires in {reward.daysUntilExpiry} day
                        {reward.daysUntilExpiry !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Redeem Button */}
                  <Button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!isAffordable || isSoldOut || redeeming === reward.id}
                    className="w-full"
                    variant={isAffordable && !isSoldOut ? 'default' : 'outline'}
                  >
                    {redeeming === reward.id ? (
                      'Redeeming...'
                    ) : !isAffordable ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Need {reward.pointsCost - userPoints} more
                      </>
                    ) : isSoldOut ? (
                      'Sold Out'
                    ) : (
                      'Redeem Now'
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* How to Earn Points */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-3 text-blue-900">How to Earn Points</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>💰 Every $1 spent</span>
            <span className="font-bold text-blue-900">1 point</span>
          </div>
          <div className="flex justify-between">
            <span>👥 Refer a friend</span>
            <span className="font-bold text-blue-900">50 points</span>
          </div>
          <div className="flex justify-between">
            <span>⭐ Leave a review</span>
            <span className="font-bold text-blue-900">25 points</span>
          </div>
          <div className="flex justify-between">
            <span>🎂 Birthday month</span>
            <span className="font-bold text-blue-900">100 bonus</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
