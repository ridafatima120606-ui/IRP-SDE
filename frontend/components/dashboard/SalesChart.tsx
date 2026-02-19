'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analytics';
import { DailySalesData } from '@/types/analytics';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export function SalesChart({ startDate, endDate, groupBy = 'day' }: SalesChartProps) {
  const [data, setData] = useState<DailySalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    loadSalesData();
  }, [startDate, endDate, groupBy]);

  const loadSalesData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyticsService.getSalesByDate({
        startDate,
        endDate,
        groupBy
      });

      if (response.data) {
        setData(response.data);
        setTotalSales(response.metadata?.totalSales || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Loading sales data...</span>
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

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Sales Trend</h3>
        <p className="text-gray-600">Total Sales: Rs {totalSales.toFixed(2)}</p>
      </div>

      {data.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No sales data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45} 
              textAnchor="end" 
              height={80}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: any) => `Rs ${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              name="Revenue"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="transactions"
              stroke="#3b82f6"
              name="Transactions"
              strokeWidth={2}
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export function SalesComparisonChart({ startDate, endDate }: { startDate?: string; endDate?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategoryData();
  }, [startDate, endDate]);

  const loadCategoryData = async () => {
    setLoading(true);
    setError(null);

    try {
      const categories = await analyticsService.getSalesByCategory({
        startDate,
        endDate
      });

      setData(categories || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Loading category data...</span>
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

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Sales by Category</h3>

      {data.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No category data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return value.toFixed(2);
                }
                return value;
              }}
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              fill="#10b981"
              name="Revenue"
            />
            <Bar
              dataKey="quantity"
              fill="#3b82f6"
              name="Quantity Sold"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
