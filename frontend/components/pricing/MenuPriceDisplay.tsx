'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { pricingService } from '@/services/phase11Service';
import { MenuItemWithDynamicPrice } from '@/types/phase11';
import { Card } from '@/components/ui/card';
import { AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

export default function MenuPriceDisplay() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [menu, setMenu] = useState<Record<string, MenuItemWithDynamicPrice[]>>({});
  const [demandLevel, setDemandLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMenu = async () => {
    if (!token) return;

    try {
      const data = await pricingService.getDynamicMenu(token);
      setMenu(data.menu);
      setDemandLevel(data.demandLevel);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  };

  // Get token from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMenu();
  }, [token]);

  const demandColors = {
    LOW: 'bg-green-50 border-green-200 text-green-800',
    MEDIUM: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    HIGH: 'bg-orange-50 border-orange-200 text-orange-800',
    PEAK: 'bg-red-50 border-red-200 text-red-800',
  };

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

  return (
    <div className="space-y-6">
      {/* Demand Level Indicator */}
      {demandLevel && (
        <div className={`border rounded-lg p-4 ${demandColors[demandLevel as keyof typeof demandColors]}`}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <div>
              <p className="font-semibold capitalize">Current Demand: {demandLevel.toLowerCase()}</p>
              <p className="text-sm opacity-75">
                {demandLevel === 'LOW' && 'Regular pricing available'}
                {demandLevel === 'MEDIUM' && 'Some items have increased prices'}
                {demandLevel === 'HIGH' && 'Multiple items experiencing surge pricing'}
                {demandLevel === 'PEAK' && 'Peak hours pricing in effect'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu by Category */}
      {Object.entries(menu).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-lg font-bold mb-3 capitalize">{category}</h3>
          <div className="grid gap-3">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      {item.isSurged && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                          <TrendingUp className="w-3 h-3" />
                          +{item.surgePercent}%
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline gap-2">
                      {item.isSurged && (
                        <span className="text-sm text-gray-500 line-through">
                          ${item.basePrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xl font-bold text-gray-900">
                        ${item.currentPrice.toFixed(2)}
                      </span>
                    </div>
                    {!item.isSurged && (
                      <p className="text-xs text-gray-500">Regular price</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {Object.keys(menu).length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No menu items available</p>
        </Card>
      )}
    </div>
  );
}
