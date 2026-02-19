'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { pricingService } from '@/services/phase11Service';
import { getToken } from '@/utils/auth';
import type { DemandForecast } from '@/types/phase11';
import { Card } from '@/components/ui/card';
import { AlertCircle, TrendingUp, Calendar } from 'lucide-react';

export default function DemandForecast() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = getToken();
      setToken(storedToken);
    }
  }, [isAuthenticated]);
  const [forecast, setForecast] = useState<DemandForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchForecast = async () => {
    if (!token) return;

    try {
      const data = await pricingService.getDemandForecast(token);
      setForecast(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5" />
        <h2 className="text-xl font-bold">7-Day Demand Forecast</h2>
      </div>

      {forecast.map((day, _) => {
        const occupancyPercent = Math.round(day.predictedOccupancy * 100);
        const priceMultiplier = (day.suggestedPriceMultiplier * 100 - 100).toFixed(1);
        
        // Color based on occupancy
        let bgColor = 'bg-green-50 border-green-200';
        let textColor = 'text-green-800';
        let intensityBar = 'bg-green-500';
        
        if (occupancyPercent > 75) {
          bgColor = 'bg-red-50 border-red-200';
          textColor = 'text-red-800';
          intensityBar = 'bg-red-500';
        } else if (occupancyPercent > 50) {
          bgColor = 'bg-orange-50 border-orange-200';
          textColor = 'text-orange-800';
          intensityBar = 'bg-orange-500';
        } else if (occupancyPercent > 25) {
          bgColor = 'bg-yellow-50 border-yellow-200';
          textColor = 'text-yellow-800';
          intensityBar = 'bg-yellow-500';
        }

        return (
          <Card key={day.date} className={`border p-4 ${bgColor}`}>
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{day.date}</p>
                  <p className={`text-sm ${textColor}`}>{day.dayOfWeek}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +{priceMultiplier}%
                  </p>
                  <p className={`text-xs ${textColor}`}>Suggested multiplier</p>
                </div>
              </div>

              {/* Occupancy Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Predicted Occupancy</span>
                  <span className="font-semibold">{occupancyPercent}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${intensityBar} transition-all`}
                    style={{ width: `${occupancyPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Confidence */}
              <div className="flex items-center justify-between text-xs">
                <span>Forecast Confidence</span>
                <span className="font-semibold">
                  {Math.round(day.confidence * 100)}%
                </span>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Summary Stats */}
      <Card className="p-4 bg-blue-50 border-blue-200 mt-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Busiest Day</p>
            <p className="font-bold text-lg">
              {forecast.reduce((max, d) => d.predictedOccupancy > max.predictedOccupancy ? d : max, forecast[0]).dayOfWeek}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Occupancy</p>
            <p className="font-bold text-lg">
              {Math.round(forecast.reduce((sum, d) => sum + d.predictedOccupancy, 0) / forecast.length * 100)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Confidence</p>
            <p className="font-bold text-lg">
              {Math.round(forecast.reduce((sum, d) => sum + d.confidence, 0) / forecast.length * 100)}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
