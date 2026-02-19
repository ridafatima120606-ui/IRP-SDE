import { useState, useCallback } from 'react';
import { pricingService } from '@/services/phase11Service';
import { DemandForecast, MenuItemWithDynamicPrice } from '@/types/phase11';

export const usePricing = (token: string | null) => {
  const [menu, setMenu] = useState<Record<string, MenuItemWithDynamicPrice[]>>({});
  const [forecast, setForecast] = useState<DemandForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getDynamicMenu = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const result = await pricingService.getDynamicMenu(token);
      setMenu(result.menu || []);
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load menu';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getItemPrice = useCallback(
    async (itemId: string) => {
      if (!token) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);

      try {
        const result = await pricingService.getItemPrice(itemId, token);
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to get price';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const getDemandForecast = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      return null;
    }

    setLoading(true);

    try {
      const result = await pricingService.getDemandForecast(token);
      setForecast(result);
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load forecast';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getAnalytics = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      return null;
    }

    setLoading(true);

    try {
      const result = await pricingService.getDemandForecast(token);
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load analytics';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const clearError = useCallback(() => setError(''), []);

  return {
    menu,
    forecast,
    loading,
    error,
    getDynamicMenu,
    getItemPrice,
    getDemandForecast,
    getAnalytics,
    clearError,
  };
};
