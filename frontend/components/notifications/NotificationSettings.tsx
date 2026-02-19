'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/phase11Service';
import { NotificationPreference } from '@/types/phase11';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check } from 'lucide-react';

export default function NotificationSettings() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  const fetchPreferences = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const result = await notificationService.getPreferences(token);
      setPreferences(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load preferences'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [token]);

  const handleToggleChannel = (channel: 'emailNotifs' | 'smsNotifs' | 'pushNotifs') => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [channel]: !preferences[channel],
    });
  };

  const handleToggleType = (_type: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
    });
  };

  const handleSave = async () => {
    if (!token || !preferences) return;

    setSaving(true);
    try {
      await notificationService.updatePreferences(preferences, token);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save settings'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (channel: 'email' | 'sms' | 'push') => {
    if (!token) return;

    try {
      await notificationService.sendTest(token);
      setSuccess(`Test ${channel.toUpperCase()} notification sent!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send test notification'
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
        <p>Unable to load notification settings</p>
      </Card>
    );
  }

  const notificationType = [
    { type: 'ORDER_READY', label: '🍕 Order Ready' },
    { type: 'RESERVATION_CONFIRMED', label: '📅 Reservation Confirmed' },
    { type: 'LOYALTY_POINTS', label: '⭐ Loyalty Points Earned' },
    { type: 'PROMOTION', label: '🎉 Promotions & Offers' },
    { type: 'WAITLIST', label: '👥 Waitlist Updates' },
    { type: 'PRICING_SURGE', label: '📈 Price Surge Alerts' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Notification Settings</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Notification Channels */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Notification Channels</h3>
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold">Email Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive notifications by email
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifs}
                  onChange={() => handleToggleChannel('emailNotifs')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
              {preferences.emailNotifs && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest('email')}
                >
                  Test
                </Button>
              )}
            </div>
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold">SMS Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive notifications by text message
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.smsNotifs}
                  onChange={() => handleToggleChannel('smsNotifs')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
              {preferences.smsNotifs && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest('sms')}
                >
                  Test
                </Button>
              )}
            </div>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold">Push Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive browser push notifications
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifs}
                  onChange={() => handleToggleChannel('pushNotifs')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
              {preferences.pushNotifs && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest('push')}
                >
                  Test
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Types */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Notification Types</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose which types of notifications you want to receive
        </p>
        <div className="space-y-3">
          {notificationType.map(({ type, label }) => (
            <label
              key={type}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <input
                type="checkbox"
                checked={
                  true
                }
                onChange={() => handleToggleType(type)}
                className="w-5 h-5 rounded border-gray-300"
              />
              <span className="font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1"
          size="lg"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={fetchPreferences}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          💡 You'll always receive important notifications about your orders and
          reservations. These settings control additional notifications like
          promotions and alerts.
        </p>
      </Card>
    </div>
  );
}
