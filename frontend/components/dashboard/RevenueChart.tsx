'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analytics';
import { RevenueAnalytics, CustomerInsights } from '@/types/analytics';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface RevenueChartProps {
  startDate?: string;
  endDate?: string;
}

export function RevenueChart({ startDate, endDate }: RevenueChartProps) {
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRevenueData();
  }, [startDate, endDate]);

  const loadRevenueData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyticsService.getRevenueAnalytics({
        startDate,
        endDate
      });

      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Loading revenue data...</span>
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

  if (!data) {
    return (
      <Card className="p-8 text-center text-gray-500">
        No revenue data available
      </Card>
    );
  }

  const isGrowth = data.growth.percentage >= 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">Rs {data.totalRevenue.toFixed(2)}</p>
            <p className="text-gray-600 text-sm mt-1">{data.totalTransactions} transactions</p>
          </div>
          <div className={`flex items-center gap-2 ${isGrowth ? 'text-green-600' : 'text-red-600'}`}>
            {isGrowth ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
            <div>
              <p className="font-bold">{Math.abs(data.growth.percentage).toFixed(1)}%</p>
              <p className="text-xs">from previous</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm">Current Period</p>
            <p className="font-bold">Rs {data.growth.comparison.current.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm">Previous Period</p>
            <p className="font-bold">Rs {data.growth.comparison.previous.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {data.byPaymentMethod.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Revenue by Payment Method</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.byPaymentMethod}
                  dataKey="amount"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.byPaymentMethod.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `Rs ${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {data.byPaymentMethod.map((method, idx) => (
                <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></div>
                    <p className="font-medium">{method.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Rs {method.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">{method.count} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

interface CustomerInsightsProps {
  startDate?: string;
  endDate?: string;
}

export function CustomerInsightsDisplay({ startDate, endDate }: CustomerInsightsProps) {
  const [data, setData] = useState<CustomerInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomerInsights();
  }, [startDate, endDate]);

  const loadCustomerInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyticsService.getCustomerInsights({
        startDate,
        endDate
      });

      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Loading customer insights...</span>
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

  if (!data) {
    return (
      <Card className="p-8 text-center text-gray-500">
        No customer data available
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-gray-600 text-sm">Total Customers</p>
          <p className="text-2xl font-bold mt-2">{data.totalCustomers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-600 text-sm">Repeat Customers</p>
          <p className="text-2xl font-bold mt-2">{data.repeatCustomers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-600 text-sm">Repeat Rate</p>
          <p className="text-2xl font-bold mt-2">{data.repeatRate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-600 text-sm">Avg Spending</p>
          <p className="text-2xl font-bold mt-2">Rs {data.avgCustomerValue.toFixed(2)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Top Customers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Rank</th>
                <th className="text-left px-4 py-2">Customer</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-right px-4 py-2">Orders</th>
                <th className="text-right px-4 py-2">Total Spent</th>
                <th className="text-right px-4 py-2">Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {data.topCustomers.map((customer, idx) => (
                <tr key={customer.userId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                  <td className="text-right px-4 py-3">{customer.orders}</td>
                  <td className="text-right px-4 py-3 font-bold">Rs {customer.spent.toFixed(2)}</td>
                  <td className="text-right px-4 py-3">Rs {customer.avgOrderValue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
