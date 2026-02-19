'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analytics';
import { PeakHourData, TopItem } from '@/types/analytics';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader } from 'lucide-react';

interface PeakHoursProps {
  startDate?: string;
  endDate?: string;
}

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export function PeakHoursChart({ startDate, endDate }: PeakHoursProps) {
  const [data, setData] = useState<PeakHourData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [peakHours, setPeakHours] = useState<PeakHourData[]>([]);

  useEffect(() => {
    loadPeakHours();
  }, [startDate, endDate]);

  const loadPeakHours = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyticsService.getPeakHours({
        startDate,
        endDate
      });

      if (response) {
        const sanitizedHourly = Array.isArray(response.hourlyBreakdown)
          ? response.hourlyBreakdown.map((row) => ({
              hour: toNumber(row.hour),
              orders: toNumber(row.orders),
              revenue: toNumber(row.revenue),
              avgOrderValue: toNumber(row.avgOrderValue)
            }))
          : [];
        const sanitizedPeaks = Array.isArray(response.peakHours)
          ? response.peakHours.map((row) => ({
              hour: toNumber(row.hour),
              orders: toNumber(row.orders),
              revenue: toNumber(row.revenue),
              avgOrderValue: toNumber(row.avgOrderValue)
            }))
          : [];

        setData(sanitizedHourly);
        setPeakHours(sanitizedPeaks);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load peak hours data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Loading peak hours data...</span>
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
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Hourly Order Distribution</h3>

        {data.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hourly data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-3 py-2">Hour</th>
                  <th className="text-right px-3 py-2">Orders</th>
                  <th className="text-right px-3 py-2">Revenue</th>
                  <th className="text-right px-3 py-2">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.hour} className="border-b">
                    <td className="px-3 py-2">{String(row.hour).padStart(2, '0')}:00</td>
                    <td className="text-right px-3 py-2">{row.orders}</td>
                    <td className="text-right px-3 py-2">Rs {toNumber(row.revenue).toFixed(2)}</td>
                    <td className="text-right px-3 py-2">Rs {toNumber(row.avgOrderValue).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {peakHours.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top 5 Peak Hours</h3>
          <div className="space-y-2">
            {peakHours.map((hour) => (
              <div key={hour.hour} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{String(hour.hour).padStart(2, '0')}:00 - {String(hour.hour + 1).padStart(2, '0')}:00</p>
                  <p className="text-sm text-gray-600">{hour.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">Rs {hour.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Rs {hour.avgOrderValue.toFixed(2)} avg</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

interface TopItemsProps {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function TopItemsChart({ startDate, endDate, limit = 10 }: TopItemsProps) {
  const [data, setData] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTopItems();
  }, [startDate, endDate, limit]);

  const loadTopItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await analyticsService.getTopItems({
        startDate,
        endDate,
        limit
      });

      const sanitizedItems = Array.isArray(items)
        ? items.map((item) => ({
            itemId: String(item.itemId || ''),
            name: String(item.name || 'Unknown'),
            category: String(item.category || 'Unknown'),
            price: toNumber(item.price),
            quantity: toNumber(item.quantity),
            orders: toNumber(item.orders),
            revenue: toNumber(item.revenue),
            rating: toNumber(item.rating)
          }))
        : [];

      setData(sanitizedItems);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load top items');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Loading top items...</span>
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
      <h3 className="text-lg font-semibold mb-6">Top Selling Items</h3>

      {data.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No item data available</p>
      ) : (
        <>
          <div className="space-y-2">
            {data.slice(0, 5).map((item, idx) => (
              <div key={item.itemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">Rs {item.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{item.quantity} sold</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
