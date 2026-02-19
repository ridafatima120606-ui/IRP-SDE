'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/utils/auth';
import type { PricingAnalytics } from '@/types/phase11';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, BarChart3, DollarSign, TrendingUp } from 'lucide-react';

export default function PricingAnalytics() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<PricingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        'http://localhost:5000/api/v1/pricing/analytics',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // Get token from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = getToken();
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  // Fetch analytics when token is available
  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
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

  if (!analytics) return null;

  const surgeRevenue = analytics.surgedRevenue;
  const totalRevenue = analytics.totalPotentialRevenue;
  const revenueIncrease = surgeRevenue;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          <h2 className="text-xl font-bold">Pricing Analytics</h2>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics}>
          Refresh
        </Button>
      </div>

      {/* Revenue Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
          <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">Base + surge</p>
        </Card>

        <Card className="p-4">
          <p className="text-gray-600 text-sm mb-1">Regular Revenue</p>
          <p className="text-2xl font-bold">${analytics.regularRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">Base pricing</p>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-green-700 text-sm mb-1 font-medium">Surge Revenue</p>
          <p className="text-2xl font-bold text-green-900">${surgeRevenue.toFixed(2)}</p>
          <p className="text-xs text-green-700 mt-2">
            +{revenueIncrease > 0 ? (revenueIncrease / analytics.regularRevenue * 100).toFixed(1) : 0}%
          </p>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-blue-700 text-sm mb-1 font-medium">Demand Level</p>
          <p className="text-2xl font-bold text-blue-900 capitalize">
            {analytics.currentDemandLevel.toLowerCase()}
          </p>
          <p className="text-xs text-blue-700 mt-2">Hour: {analytics.currentHour}:00</p>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Items Statistics */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Items with Pricing Rules
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Items</span>
              <span className="font-bold">{analytics.totalItemsWithPricing}</span>
            </div>
            <div className="w-full bg-gray-200 rounded h-1"></div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">With Surge Pricing</span>
              <span className="font-bold text-green-700">{analytics.itemsWithSurge}</span>
            </div>
            <div className="w-full bg-gray-200 rounded h-1"></div>
            <p className="text-xs text-gray-500 text-right">
              {analytics.totalItemsWithPricing > 0
                ? ((analytics.itemsWithSurge / analytics.totalItemsWithPricing) * 100).toFixed(1)
                : 0}% active surge
            </p>
          </div>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Revenue Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Surge Contribution</span>
              <span className="font-bold text-green-700">
                {analytics.surgeContributionPercent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-500 h-full"
                style={{ width: `${Math.min(analytics.surgeContributionPercent, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              {surgeRevenue > 0
                ? `${surgeRevenue.toFixed(2)} additional revenue from surge pricing`
                : 'No surge pricing in effect'}
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2 text-blue-900">Recommendations</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {analytics.currentDemandLevel === 'LOW' && (
            <>
              <li>• Consider promotional pricing to increase volume</li>
              <li>• Current demand is low - good time for maintenance</li>
              <li>• No surge pricing needed at this time</li>
            </>
          )}
          {analytics.currentDemandLevel === 'MEDIUM' && (
            <>
              <li>• Standard pricing is optimal</li>
              <li>• Monitor demand levels closely</li>
              <li>• Prepare for potential peak hours</li>
            </>
          )}
          {analytics.currentDemandLevel === 'HIGH' && (
            <>
              <li>• Surge pricing is active - monitor customer feedback</li>
              <li>• Good revenue opportunity</li>
              <li>• Ensure kitchen and staff can handle demand</li>
            </>
          )}
          {analytics.currentDemandLevel === 'PEAK' && (
            <>
              <li>• Peak pricing in effect - revenue optimized</li>
              <li>• Consider waitlist if not already enabled</li>
              <li>• Maximum pricing multiplier applied</li>
            </>
          )}
        </ul>
      </Card>
    </div>
  );
}
