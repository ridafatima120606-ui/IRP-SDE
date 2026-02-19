'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DashboardMetricsDisplay } from '@/components/dashboard/DashboardMetricsDisplay';
import { SalesChart, SalesComparisonChart } from '@/components/dashboard/SalesChart';
import { PeakHoursChart, TopItemsChart } from '@/components/dashboard/PeakHoursChart';
import { RevenueChart, CustomerInsightsDisplay } from '@/components/dashboard/RevenueChart';
import { Card } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Download } from 'lucide-react';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined
  });

  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value || undefined
    }));
  };

  const exportData = async () => {
    // In a real application, you'd export the data to CSV or PDF
    alert('Export functionality would be implemented here');
  };

  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track sales, revenue, and customer insights</p>
        </div>

        {/* Controls */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Date Range */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate || last30Days}
                    onChange={handleDateRangeChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate || today}
                    onChange={handleDateRangeChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Group By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group By
                </label>
                <div className="flex gap-2">
                  {(['day', 'week', 'month'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setGroupBy(option)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        groupBy === option
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={exportData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Dashboard */}
        <div className="space-y-8" key={refreshKey}>
          {/* Metrics Overview */}
          <section>
            <ErrorBoundary>
              <DashboardMetricsDisplay
                startDate={dateRange.startDate || last30Days}
                endDate={dateRange.endDate || today}
              />
            </ErrorBoundary>
          </section>

          {/* Sales Analytics */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Sales Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ErrorBoundary>
                <SalesChart
                  startDate={dateRange.startDate || last30Days}
                  endDate={dateRange.endDate || today}
                  groupBy={groupBy}
                />
              </ErrorBoundary>
              <ErrorBoundary>
                <SalesComparisonChart
                  startDate={dateRange.startDate || last30Days}
                  endDate={dateRange.endDate || today}
                />
              </ErrorBoundary>
            </div>
          </section>

          {/* Peak Hours & Top Items */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Performance Metrics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ErrorBoundary>
                <PeakHoursChart
                  startDate={dateRange.startDate || last30Days}
                  endDate={dateRange.endDate || today}
                />
              </ErrorBoundary>
              <div>
                <ErrorBoundary>
                  <TopItemsChart
                    startDate={dateRange.startDate || last30Days}
                    endDate={dateRange.endDate || today}
                    limit={10}
                  />
                </ErrorBoundary>
              </div>
            </div>
          </section>

          {/* Revenue & Customer Insights */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Financial & Customer Data</h2>
            <ErrorBoundary>
              <RevenueChart
                startDate={dateRange.startDate || last30Days}
                endDate={dateRange.endDate || today}
              />
            </ErrorBoundary>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Customer Insights</h2>
            <ErrorBoundary>
              <CustomerInsightsDisplay
                startDate={dateRange.startDate || last30Days}
                endDate={dateRange.endDate || today}
              />
            </ErrorBoundary>
          </section>

          {/* Help Section */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Dashboard Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use the date range to filter data for specific periods</li>
                  <li>• Select different grouping options to view trends at various levels</li>
                  <li>• Hover over charts for detailed information</li>
                  <li>• Click Refresh to reload the latest data</li>
                  <li>• Use Export to download reports (Feature coming soon)</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
