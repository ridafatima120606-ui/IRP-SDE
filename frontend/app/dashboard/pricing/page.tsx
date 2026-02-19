'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MenuPriceDisplay from '@/components/pricing/MenuPriceDisplay';
import { Card } from '@/components/ui/card';

export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  if (!token) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg">Please log in to view the menu.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Menu with Dynamic Pricing</h1>
      <p className="text-gray-600">
        Prices adjust based on current demand. Check back often for the best deals!
      </p>
      <MenuPriceDisplay />
    </div>
  );
}
