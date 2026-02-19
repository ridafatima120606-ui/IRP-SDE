'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ReferralProgram from '@/components/loyalty/ReferralProgram';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReferralPage() {
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
        <p className="text-lg">Please log in to access the referral program.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/dashboard/loyalty')}
        >
          ← Back to Loyalty
        </Button>
      </div>

      <ReferralProgram />
    </div>
  );
}
