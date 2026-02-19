'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/phase11Service';
import { Notification } from '@/types/phase11';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = localStorage.getItem('authToken');
      setToken(storedToken);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const result = await notificationService.getNotifications(token, 1, 5);
      setNotifications(result.notifications.slice(0, 5));
      const unread = result.notifications.filter(
        (n: Notification) => n.status === 'PENDING'
      ).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000); // Refresh every 15 seconds

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
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
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

  return (
    <div className="relative">
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-xl">
          <div className="max-h-96 overflow-auto">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Loading State */}
            {loading && notifications.length === 0 && (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            )}

            {/* Notifications List */}
            {notifications.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            )}

            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                  notification.status === 'PENDING' ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {notification.status === 'PENDING' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleMarkAsRead(notification.id)
                      }
                      className="flex-shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* View All Link */}
            {notifications.length > 0 && (
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notification center
                    window.location.href = '/notifications';
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Overlay close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
