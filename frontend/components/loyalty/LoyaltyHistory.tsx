'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { loyaltyService } from '@/services/phase11Service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronDown } from 'lucide-react';

export default function LoyaltyHistory() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    if (!token) return;

    try {
      const data = await loyaltyService.getHistory(token);
      setHistory(data.history);
      setSummary(data.summary);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Points History</h2>

      {/* Summary Cards */}
      {summary && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-gray-600 text-sm mb-1">Total Earned</p>
            <p className="text-3xl font-bold">{summary.totalPointsEarned}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm mb-1">Total Redeemed</p>
            <p className="text-3xl font-bold">{summary.totalPointsSpent}</p>
          </Card>
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-blue-700 text-sm mb-1 font-medium">Total Rewards</p>
            <p className="text-3xl font-bold text-blue-900">{summary.totalRewards}</p>
          </Card>
        </div>
      )}

      {/* History List */}
      <div className="space-y-2">
        {history.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <p>No redemption history yet</p>
            <p className="text-sm">Start earning and redeeming rewards!</p>
          </Card>
        ) : (
          history.slice(0, limit).map((item) => (
            <Card
              key={item.id}
              className={`p-4 flex items-center justify-between ${
                item.status === 'REDEEMED'
                  ? 'border-green-200 bg-green-50'
                  : item.status === 'CANCELLED'
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold">{item.reward?.name}</p>
                <div className="flex gap-3 text-xs text-gray-600 mt-1">
                  <span>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{item.status.toLowerCase()}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  -{item.pointsSpent}
                </p>
                <p className="text-xs text-gray-600">points</p>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {history.length > limit && (
        <Button
          variant="outline"
          onClick={() => setLimit(limit + 10)}
          className="w-full flex items-center justify-center gap-2"
        >
          <ChevronDown className="w-4 h-4" />
          Load More
        </Button>
      )}
    </div>
  );
}
