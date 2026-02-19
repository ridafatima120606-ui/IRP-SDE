import { useState, useCallback } from 'react';
import { paymentService } from '@/services/payment';
import { PaymentHistoryItem, PaymentStatus } from '@/types/payment';

export function usePayment(orderId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');

  const createPayment = useCallback(
    async (amount: number, currency = 'usd') => {
      setLoading(true);
      setError(null);

      try {
        const intent = await paymentService.createPaymentIntent(
          orderId,
          amount,
          currency
        );
        setPaymentId(intent.paymentId);
        return intent;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to create payment';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [orderId]
  );

  const confirmPayment = useCallback(
    async (paymentIntentId?: string) => {
      setLoading(true);
      setError(null);

      try {
        const payment = await paymentService.confirmPayment(
          paymentIntentId,
          orderId
        );
        setPaymentStatus(payment.status as PaymentStatus);
        setPaymentId(payment.id);
        return payment;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to confirm payment';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [orderId]
  );

  const refundPayment = useCallback(
    async (payId: string, reason?: string) => {
      setLoading(true);
      setError(null);

      try {
        const payment = await paymentService.refundPayment(payId, reason);
        setPaymentStatus('REFUNDED');
        return payment;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to refund payment';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getInvoice = useCallback(
    async (payId: string) => {
      setLoading(true);
      setError(null);

      try {
        return await paymentService.generateInvoice(payId);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to get invoice';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const downloadInvoice = useCallback(
    async (payId: string) => {
      setLoading(true);
      setError(null);

      try {
        await paymentService.generateInvoice(payId, 'pdf');
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to download invoice';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);
  const reset = useCallback(() => {
    setError(null);
    setPaymentId(null);
    setPaymentStatus('PENDING');
  }, []);

  return {
    loading,
    error,
    paymentId,
    paymentStatus,
    createPayment,
    confirmPayment,
    refundPayment,
    getInvoice,
    downloadInvoice,
    clearError,
    reset
  };
}
