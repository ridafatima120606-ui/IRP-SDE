'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { waitlistService } from '@/services/phase11Service';
import { WaitlistJoinRequest, WaitlistResponse } from '@/types/phase11';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { getToken } from '@/utils/auth';

export default function WaitlistJoinForm() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [preferredTime, setPreferredTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<WaitlistResponse | null>(null);

  // Get token from cookie-based auth on component mount
  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = getToken();
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  const minimumTime = new Date();
  minimumTime.setMinutes(minimumTime.getMinutes() + 15);
  const minTimeString = minimumTime.toISOString().slice(0, 16);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!preferredTime) {
      setError('Please select a time');
      return;
    }

    if (guestCount < 1 || guestCount > 20) {
      setError('Guest count must be between 1 and 20');
      return;
    }

    setLoading(true);
    try {
      const request: WaitlistJoinRequest = {
        guestCount,
        preferredTime: new Date(preferredTime).toISOString(),
      };

      const result = await waitlistService.joinWaitlist(request, token!);
      setSuccess(result);
      setGuestCount(2);
      setPreferredTime('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Join Waitlist</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Added to Waitlist!</p>
              <p className="text-green-800">{success.message}</p>
            </div>
          </div>

          <div className="bg-white rounded p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Position:</span>
              <span className="font-semibold"># {success.position}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Est. Wait:</span>
              <span className="font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4" /> {success.estimatedWaitMinutes} min
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = `/waitlist/${success.id}`}
              className="flex-1"
            >
              Check Status
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSuccess(null)}
              className="flex-1"
            >
              Join Another
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests
            </label>
            <Input
              type="number"
              min="1"
              max="20"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">1-20 guests</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time
            </label>
            <Input
              type="datetime-local"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              min={minTimeString}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 15 minutes from now</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Joining...' : 'Join Waitlist'}
          </Button>

          <p className="text-xs text-center text-gray-500">
            You'll receive a notification when your table is ready
          </p>
        </form>
      )}
    </Card>
  );
}
