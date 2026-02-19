'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export default function NotificationsPage() {
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
        <p className="text-lg">Please log in to view notifications.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/settings/notifications')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <NotificationCenter />
    </div>
  );
}
