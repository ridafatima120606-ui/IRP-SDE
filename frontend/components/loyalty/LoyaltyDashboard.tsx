'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { loyaltyService } from '@/services/phase11Service';
import { LoyaltyProfile } from '@/types/phase11';
import { Card } from '@/components/ui/card';
import { AlertCircle, Gift, Zap, Award } from 'lucide-react';

export default function LoyaltyDashboard() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    if (!token) return;

    try {
      const data = await loyaltyService.getProfile(token);
      setProfile(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  const tierColors = {
    SILVER: { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-600' },
    GOLD: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' },
    PLATINUM: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
  };

  const colors = tierColors[profile.tier];

  return (
    <div className="space-y-6">
      {/* Main Tier Card */}
      <Card className={`border ${colors.border} ${colors.bg} p-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm text-gray-600 mb-2">Your Tier</h2>
            <h1 className="text-4xl font-bold capitalize">{profile.tier}</h1>
            {profile.tierProgression.next && (
              <p className="text-sm text-gray-600 mt-2">
                {profile.tierProgression.pointsToNextTier} points to {profile.tierProgression.next}
              </p>
            )}
          </div>
          <Award className={`w-16 h-16 ${colors.icon}`} />
        </div>
      </Card>

      {/* Points and Progress */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Points */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Points</p>
            <Zap className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold">{profile.points}</p>
          <p className="text-xs text-gray-500 mt-2">Available to redeem</p>
        </Card>

        {/* Total Spent */}
        <Card className="p-4">
          <p className="text-gray-600 text-sm mb-2">Total Spent</p>
          <p className="text-3xl font-bold">${profile.totalSpent.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">Lifetime value</p>
        </Card>

        {/* Point Multiplier */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-blue-700 text-sm mb-2 font-medium">Point Multiplier</p>
          <p className="text-3xl font-bold text-blue-900">
            {profile.benefits.pointMultiplier}x
          </p>
          <p className="text-xs text-blue-700 mt-2">Earn faster!</p>
        </Card>
      </div>

      {/* Tier Benefits */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5" />
          {profile.tier} Member Benefits
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {profile.tier === 'SILVER' && (
            <>
              <div className="flex gap-3">
                <div className="text-2xl">🎂</div>
                <div>
                  <p className="font-semibold text-sm">Birthday Discount</p>
                  <p className="text-xs text-gray-600">5% off your birthday month</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">📅</div>
                <div>
                  <p className="font-semibold text-sm">Early Access</p>
                  <p className="text-xs text-gray-600">Reserve ahead of time</p>
                </div>
              </div>
            </>
          )}

          {profile.tier === 'GOLD' && (
            <>
              <div className="flex gap-3">
                <div className="text-2xl">🎂</div>
                <div>
                  <p className="font-semibold text-sm">Birthday Discount</p>
                  <p className="text-xs text-gray-600">10% off your birthday month</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">🍽️</div>
                <div>
                  <p className="font-semibold text-sm">Free Appetizer</p>
                  <p className="text-xs text-gray-600">Once per month</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">💎</div>
                <div>
                  <p className="font-semibold text-sm">VIP Seating</p>
                  <p className="text-xs text-gray-600">Priority table reservation</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <p className="font-semibold text-sm">1.5x Points</p>
                  <p className="text-xs text-gray-600">Earn faster on every order</p>
                </div>
              </div>
            </>
          )}

          {profile.tier === 'PLATINUM' && (
            <>
              <div className="flex gap-3">
                <div className="text-2xl">🎂</div>
                <div>
                  <p className="font-semibold text-sm">Birthday Discount</p>
                  <p className="text-xs text-gray-600">20% off your birthday month</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">🍽️</div>
                <div>
                  <p className="font-semibold text-sm">Free Meal</p>
                  <p className="text-xs text-gray-600">Once per quarter</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">🏨</div>
                <div>
                  <p className="font-semibold text-sm">Lounge Access</p>
                  <p className="text-xs text-gray-600">VIP lounge included</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">👤</div>
                <div>
                  <p className="font-semibold text-sm">Personal Concierge</p>
                  <p className="text-xs text-gray-600">Dedicated support</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <p className="font-semibold text-sm">2x Points</p>
                  <p className="text-xs text-gray-600">Double points on all orders</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">💎</div>
                <div>
                  <p className="font-semibold text-sm">VIP Seating</p>
                  <p className="text-xs text-gray-600">Best tables reserved</p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Tier Progress */}
      {profile.tierProgression.next && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-blue-700 text-sm mb-3 font-medium">
            Progress to {profile.tierProgression.next}
          </p>
          <div className="relative">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${Math.min(profile.tierProgression.progressPercent, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              {Math.round(profile.tierProgression.progressPercent)}% complete
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
