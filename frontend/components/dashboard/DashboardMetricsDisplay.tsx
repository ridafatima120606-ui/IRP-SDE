'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analytics';
import { DashboardMetrics } from '@/types/analytics';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, DollarSign, ShoppingCart, Users, Coffee, Loader } from 'lucide-react';

interface DashboardMetricsDisplayProps {
  startDate?: string;
  endDate?: string;
  onRefresh?: () => void;
}

export function DashboardMetricsDisplay({ startDate, endDate, onRefresh }: DashboardMetricsDisplayProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, [startDate, endDate]);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getDashboardOverview({
        startDate,
        endDate
      });
      setMetrics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Loading metrics...</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Card className="p-8 text-center text-gray-500">
        No metrics data available
      </Card>
    );
  }

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className: string }>;
    color: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`Rs ${metrics.revenue.total.toFixed(2)}`}
          subtitle={`${metrics.revenue.transactions} transactions`}
          icon={DollarSign}
          color="bg-green-500"
        />

        <MetricCard
          title="Total Orders"
          value={metrics.orders.total}
          subtitle={`Avg: Rs ${metrics.orders.average.toFixed(2)}`}
          icon={ShoppingCart}
          color="bg-blue-500"
        />

        <MetricCard
          title="Customers"
          value={metrics.customers.total}
          subtitle={`${metrics.customers.returning} returning`}
          icon={Users}
          color="bg-purple-500"
        />

        <MetricCard
          title="Table Utilization"
          value={`${metrics.tables.utilization}%`}
          subtitle={`${metrics.tables.total} tables`}
          icon={Coffee}
          color="bg-orange-500"
        />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">Rs {metrics.revenue.total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Average Order Value</p>
            <p className="text-2xl font-bold text-blue-600">Rs {metrics.revenue.average.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Customer Value</p>
            <p className="text-2xl font-bold text-purple-600">
              Rs {metrics.customers.total > 0 
                ? (metrics.revenue.total / metrics.customers.total).toFixed(2) 
                : '0.00'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
