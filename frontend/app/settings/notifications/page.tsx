'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function NotificationSettingsPage() {
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
        <p className="text-lg">Please log in to access settings.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (window.location.href = '/notifications')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
      </div>

      <NotificationSettings />
    </div>
  );
}
