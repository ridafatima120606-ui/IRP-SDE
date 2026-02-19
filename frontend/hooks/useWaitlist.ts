import { useState, useCallback } from 'react';
import { waitlistService } from '@/services/phase11Service';
import { WaitlistEntry } from '@/types/phase11';

export const useWaitlist = (token: string | null) => {
  const [waitlistEntry, setWaitlistEntry] = useState<WaitlistEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const joinWaitlist = useCallback(
    async (guestCount: number, preferredTime: string) => {
      if (!token) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);
      setError('');

      try {
        const result = await waitlistService.joinWaitlist(
          { guestCount, preferredTime },
          token
        );
        setWaitlistEntry({
          id: result.id,
          userId: '', // Will be set from token
          guestCount: 0,
          preferredTime: new Date().toISOString(),
          priority: 0,
          status: 'WAITING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as WaitlistEntry);
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to join waitlist';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const getStatus = useCallback(async () => {
    if (!token || !waitlistEntry?.id) {
      setError('Invalid waitlist entry');
      return null;
    }

    setLoading(true);

    try {
      const result = await waitlistService.getStatus(
        waitlistEntry.id,
        token
      );
      setWaitlistEntry(result);
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to get status';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, waitlistEntry?.id]);

  const cancelWaitlist = useCallback(async () => {
    if (!token || !waitlistEntry?.id) {
      setError('Invalid waitlist entry');
      return false;
    }

    setLoading(true);

    try {
      await waitlistService.cancel(waitlistEntry.id, token);
      setWaitlistEntry(null);
      return true;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to cancel';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, waitlistEntry?.id]);

  const clearError = useCallback(() => setError(''), []);

  return {
    waitlistEntry,
    loading,
    error,
    joinWaitlist,
    getStatus,
    cancelWaitlist,
    clearError,
  };
};
