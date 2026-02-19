'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';
import RewardsShop from '@/components/loyalty/RewardsShop';
import LoyaltyHistory from '@/components/loyalty/LoyaltyHistory';

type TabType = 'dashboard' | 'rewards' | 'history';

export default function LoyaltyPage() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  if (!token) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg">Please log in to access your loyalty program.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Loyalty Program</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b flex-wrap">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </Button>
        <Button
          variant={activeTab === 'rewards' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('rewards')}
        >
          Rewards Shop
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('history')}
        >
          History
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/dashboard/loyalty/referral')}
          className="ml-auto"
        >
          Refer a Friend →
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && <LoyaltyDashboard />}
      {activeTab === 'rewards' && <RewardsShop />}
      {activeTab === 'history' && <LoyaltyHistory />}
    </div>
  );
}
