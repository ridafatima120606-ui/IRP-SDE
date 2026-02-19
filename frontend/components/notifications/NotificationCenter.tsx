'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/phase11Service';
import { Notification } from '@/types/phase11';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function NotificationCenter() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async (pageNum = 1) => {
    if (!token) return;

    setLoading(true);
    try {
      const result = await notificationService.getNotifications(token, pageNum);
      if (pageNum === 1) {
        setNotifications(result.notifications);
      } else {
        setNotifications((prev) => [...prev, ...result.notifications]);
      }
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
    const interval = setInterval(() => {
      fetchNotifications(1);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await notificationService.markAsRead(notificationId, token);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to mark as read'
      );
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!token) return;

    try {
      await notificationService.delete(notificationId, token);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_READY':
        return '🍕';
      case 'RESERVATION_CONFIRMED':
        return '📅';
      case 'LOYALTY_POINTS':
        return '⭐';
      case 'PROMOTION':
        return '🎉';
      default:
        return '📬';
    }
  };

  const getTypeLabel = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const filteredNotifications =
    filter === 'all'
      ? notifications
      : notifications.filter(
          (n) => n.type === filter || n.status === filter
        );

  const unreadCount = notifications.filter((n) => n.status === 'PENDING').length;

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {unreadCount > 0 && (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
            {unreadCount} Unread
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'PENDING', 'ORDER', 'LOYALTY', 'PROMOTION'].map(
          (f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className="whitespace-nowrap"
            >
              {f === 'all' ? 'All' : getTypeLabel(f)}
            </Button>
          )
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No notifications</p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-all ${
                notification.status === 'PENDING'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex gap-4">
                <div className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(notification.createdAt).toLocaleDateString()}{' '}
                    {new Date(notification.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {notification.status === 'PENDING' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleMarkAsRead(notification.id)
                      }
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(notification.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <Button
          onClick={() => {
            setPage((p) => p + 1);
            fetchNotifications(page + 1);
          }}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
}
