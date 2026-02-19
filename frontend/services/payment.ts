import { apiClient } from '@/utils/api';
import { PaymentIntent, Payment, PaymentHistoryItem, Invoice, PaymentResponse } from '@/types/payment';

export const paymentService = {
  // Create payment intent for checkout
  createPaymentIntent: async (orderId: string, amount: number, currency = 'usd', paymentMethod = 'card') => {
    const response = await apiClient.post<PaymentResponse<PaymentIntent>>('/payments/intent', {
      orderId,
      amount,
      currency,
      paymentMethod
    });
    return response.data.data;
  },

  // Confirm payment after successful Stripe transaction
  confirmPayment: async (paymentIntentId?: string, orderId?: string) => {
    const response = await apiClient.post<PaymentResponse<Payment>>('/payments/confirm', {
      paymentIntentId,
      orderId
    });
    return response.data.data;
  },

  // Get payment history for the authenticated user
  getPaymentHistory: async (limit = 10, offset = 0) => {
    const response = await apiClient.get<PaymentResponse<PaymentHistoryItem[]>>('/payments/history', {
      params: { limit, offset }
    });
    return {
      data: response.data.data || [],
      pagination: response.data.pagination
    };
  },

  // Get details of a specific payment
  getPaymentDetails: async (paymentId: string) => {
    const response = await apiClient.get<PaymentResponse<Payment>>(`/payments/${paymentId}`);
    return response.data.data;
  },

  // Refund a completed payment
  refundPayment: async (paymentId: string, reason?: string) => {
    const response = await apiClient.post<PaymentResponse<Payment>>(`/payments/${paymentId}/refund`, {
      reason
    });
    return response.data.data;
  },

  // Generate invoice (returns JSON by default, can request PDF)
  generateInvoice: async (paymentId: string, format = 'json') => {
    if (format === 'pdf') {
      // For PDF, we'll download it directly
      window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/payments/${paymentId}/invoice?format=pdf`, '_blank');
      return;
    }

    const response = await apiClient.get<PaymentResponse<Invoice>>(`/payments/${paymentId}/invoice`);
    return response.data.data;
  }
};
