import { useState, useCallback } from 'react';
import { notificationService } from '@/services/phase11Service';
import { Notification, NotificationPreference } from '@/types/phase11';

export const useNotifications = (token: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(
    null
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getNotifications = useCallback(
    async (page = 1, limit = 10) => {
      if (!token) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);
      setError('');

      try {
        const result = await notificationService.getNotifications(
          token,
          page,
          limit
        );
        if (page === 1) {
          setNotifications(result.notifications);
        } else {
          setNotifications((prev) => [...prev, ...result.notifications]);
        }

        const unread = result.notifications.filter(
          (n: Notification) => n.status === 'PENDING'
        ).length;
        setUnreadCount(unread);

        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to load notifications';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!token) {
        setError('Not authenticated');
        return false;
      }

      try {
        await notificationService.markAsRead(notificationId, token);
        setNotifications((prev: Notification[]) =>
          prev.map((n: Notification) =>
            n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        return true;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to mark as read';
        setError(errorMsg);
        return false;
      }
    },
    [token]
  );

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!token) {
        setError('Not authenticated');
        return false;
      }

      try {
        await notificationService.delete(notificationId, token);
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
        return true;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to delete';
        setError(errorMsg);
        return false;
      }
    },
    [token]
  );

  const getPreferences = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      return null;
    }

    setLoading(true);

    try {
      const result = await notificationService.getPreferences(token);
      setPreferences(result);
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load preferences';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updatePreferences = useCallback(
    async (newPreferences: NotificationPreference) => {
      if (!token) {
        setError('Not authenticated');
        return false;
      }

      setLoading(true);

      try {
        await notificationService.updatePreferences(newPreferences, token);
        setPreferences(newPreferences);
        return true;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to save preferences';
        setError(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const sendTestNotification = useCallback(
    async () => {
      if (!token) {
        setError('Not authenticated');
        return false;
      }

      try {
        await notificationService.sendTest(token);
        return true;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to send test';
        setError(errorMsg);
        return false;
      }
    },
    [token]
  );

  const clearError = useCallback(() => setError(''), []);

  return {
    notifications,
    preferences,
    unreadCount,
    loading,
    error,
    getNotifications,
    markAsRead,
    deleteNotification,
    getPreferences,
    updatePreferences,
    sendTestNotification,
    clearError,
  };
};
