'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { waitlistService } from '@/services/phase11Service';
import { WaitlistEntry } from '@/types/phase11';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Users, Clock, X } from 'lucide-react';

interface WaitlistStatusProps {
  waitlistId?: string;
}

export default function WaitlistStatus({ waitlistId }: WaitlistStatusProps) {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<WaitlistEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [position, setPosition] = useState<number | null>(null);
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null);

  const id = waitlistId || localStorage.getItem('currentWaitlistId');

  // Get token from localStorage on mount
  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  const fetchStatus = async () => {
    if (!id || !token) return;

    try {
      const data = await waitlistService.getStatus(id, token);
      setStatus(data);
      if (data.position !== undefined) {
        setPosition(data.position);
      }
      if (data.estimatedWaitMinutes !== undefined) {
        setEstimatedWait(data.estimatedWaitMinutes);
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [id, token]);

  const handleCancel = async () => {
    if (!id || !token) return;

    if (!confirm('Are you sure you want to cancel?')) return;

    try {
      await waitlistService.cancel(id, token);
      setStatus(null);
      setPosition(null);
      setEstimatedWait(null);
      localStorage.removeItem('currentWaitlistId');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel');
    }
  };

  if (!id) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <p className="text-gray-500 text-center">No active waitlist entry</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <p className="text-gray-500 text-center">No active entry found</p>
      </Card>
    );
  }

  const statusColors = {
    WAITING: 'bg-blue-50 border-blue-200',
    NOTIFIED: 'bg-yellow-50 border-yellow-200',
    SEATED: 'bg-green-50 border-green-200',
    CANCELLED: 'bg-red-50 border-red-200',
  };

  const statusIcons = {
    WAITING: Clock,
    NOTIFIED: AlertCircle,
    SEATED: CheckCircle2,
    CANCELLED: X,
  };

  const StatusIcon = statusIcons[status.status];

  return (
    <Card className={`w-full max-w-md mx-auto p-6 border ${statusColors[status.status]}`}>
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-center gap-3">
          <StatusIcon className="w-6 h-6" />
          <div>
            <h2 className="text-lg font-bold">
              {status.status === 'WAITING' && 'Waiting for a Table'}
              {status.status === 'NOTIFIED' && 'Table is Available!'}
              {status.status === 'SEATED' && 'Seated ✓'}
              {status.status === 'CANCELLED' && 'Cancelled'}
            </h2>
            <p className="text-sm text-gray-600">Updated just now</p>
          </div>
        </div>

        {/* Position and Wait Time */}
        {(status.status === 'WAITING' || status.status === 'NOTIFIED') && (
          <div className="grid grid-cols-2 gap-4 bg-white bg-opacity-50 rounded-lg p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-600">Position</p>
              <p className="text-3xl font-bold">{position}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-600">Est. Wait</p>
              <p className="text-3xl font-bold flex items-center gap-1">
                {estimatedWait} <span className="text-lg">min</span>
              </p>
            </div>
          </div>
        )}

        {/* Guest Details */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Party Size:</span>
            <span className="font-semibold flex items-center gap-1">
              <Users className="w-4 h-4" /> {status.guestCount} {status.guestCount === 1 ? 'Guest' : 'Guests'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Preferred Time:</span>
            <span className="font-semibold">
              {new Date(status.preferredTime).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Priority Score:</span>
            <span className="font-semibold">{status.priority} pts</span>
          </div>
        </div>

        {/* Progress Bar */}
        {status.status === 'WAITING' && position && estimatedWait && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600">Estimated progress</p>
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(((8 - position) / 8) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {status.status === 'NOTIFIED' && (
            <Button variant="default" className="flex-1">
              I'm Here!
            </Button>
          )}
          {status.status === 'WAITING' && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            onClick={fetchStatus}
            className="flex-1"
          >
            Refresh
          </Button>
        </div>

        {/* Auto-Refresh Info */}
        <p className="text-xs text-center text-gray-500">
          Position updates automatically every 30 seconds
        </p>
      </div>
    </Card>
  );
}
