'use client';

import { useAuth } from '@/hooks/useAuth';
import DemandForecast from '@/components/pricing/DemandForecast';
import PricingAnalytics from '@/components/pricing/PricingAnalytics';
import PricingRules from '@/components/pricing/PricingRules';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type TabType = 'forecast' | 'analytics' | 'rules';

export default function AdminPricingPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('forecast');

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg">Loading...</p>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg">Please log in to access this page.</p>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="p-8 border-red-200 bg-red-50">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Access Denied</h3>
            <p className="text-red-800">You don't have permission to access this page.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dynamic Pricing Management</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'forecast' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('forecast')}
        >
          Demand Forecast
        </Button>
        <Button
          variant={activeTab === 'analytics' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </Button>
        <Button
          variant={activeTab === 'rules' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('rules')}
        >
          Pricing Rules
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'forecast' && <DemandForecast />}
      {activeTab === 'analytics' && <PricingAnalytics />}
      {activeTab === 'rules' && <PricingRules />}
    </div>
  );
}
