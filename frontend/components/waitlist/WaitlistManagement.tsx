'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/utils/auth';
import { WaitlistEntry, WaitlistStats } from '@/types/phase11';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users, Clock, TrendingUp } from 'lucide-react';

export default function WaitlistManagement() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'waiting' | 'seated' | 'cancelled'>('all');
  const [error, setError] = useState('');

  // Get token from localStorage on mount
  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = getToken();
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    if (!token) return;

    try {
      // Fetch all waitlist entries
      const response = await fetch(
        `http://localhost:5000/api/v1/waitlist/admin/list?status=${filter === 'all' ? '' : filter.toUpperCase()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEntries(data.entries);

      // Fetch statistics
      const statsRes = await fetch(
        'http://localhost:5000/api/v1/waitlist/admin/stats',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, filter]);

  const handleSeat = async (entryId: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/waitlist/${entryId}/seat`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to seat customer');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seat customer');
    }
  };

  const handleRemove = async (entryId: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/waitlist/${entryId}/remove`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to remove');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Currently Waiting</p>
            <p className="text-3xl font-bold">{stats.currentlyWaiting}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Seated Today</p>
            <p className="text-3xl font-bold">{stats.seatedToday}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Avg Wait Time</p>
            <p className="text-3xl font-bold">{stats.averageWaitTimeMinutes}m</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Peak Hours</p>
            <p className="text-lg font-bold">{stats.peakTime}</p>
          </Card>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'waiting', 'seated', 'cancelled'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === 'all' ? 'All' : f === 'waiting' ? 'Waiting' : f === 'seated' ? 'Seated' : 'Cancelled'}
          </Button>
        ))}
        <Button variant="outline" onClick={fetchData} className="ml-auto">
          Refresh
        </Button>
      </div>

      {/* Waitlist Entries */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ) : entries.length === 0 ? (
          <Card className="p-4 text-center text-gray-500">
            No entries found
          </Card>
        ) : (
          entries.map((entry, idx) => (
            <Card key={entry.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="font-bold text-lg text-gray-400 w-8"># {idx + 1}</div>
                  <div>
                    <p className="font-semibold">{entry.userId || 'Guest'}</p>
                    <p className="text-sm text-gray-600">
                      User ID: {entry.userId}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {entry.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm mb-4 bg-gray-50 p-3 rounded">
                <div>
                  <p className="text-gray-600 text-xs">Guests</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Users className="w-4 h-4" /> {entry.guestCount}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Wait Time</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {Math.round((new Date().getTime() - new Date(entry.createdAt).getTime()) / 60000)}m
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Priority</p>
                  <p className="font-semibold flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> {entry.priority}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {entry.status === 'WAITING' && (
                  <Button
                    onClick={() => handleSeat(entry.id)}
                    size="sm"
                    className="flex-1"
                  >
                    Seat Now
                  </Button>
                )}
                <Button
                  onClick={() => handleRemove(entry.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
