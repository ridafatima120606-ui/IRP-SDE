'use client';

import { useEffect, useState } from 'react';
import { paymentService } from '@/services/payment';
import { PaymentHistoryItem } from '@/types/payment';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Download, Eye, RotateCcw, Loader } from 'lucide-react';
import { formatDate } from '@/utils/format';

interface PaymentHistoryProps {
  onSelectPayment?: (payment: PaymentHistoryItem) => void;
}

export function PaymentHistory({ onSelectPayment }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ limit: 10, offset: 0, total: 0 });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.getPaymentHistory(pagination.limit, pagination.offset);
      setPayments(result.data);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Are you sure you want to refund this payment?')) return;

    setRefundingId(paymentId);
    try {
      await paymentService.refundPayment(paymentId, 'Customer requested refund');
      setPayments(payments.map(p => 
        p.id === paymentId ? { ...p, status: 'REFUNDED' } : p
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to refund payment');
    } finally {
      setRefundingId(null);
    }
  };

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      await paymentService.generateInvoice(paymentId, 'pdf');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading payment history...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Payment History</h2>

      {error && (
        <Alert className="border-red-200 bg-red-50 mb-4">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {payments.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No payments found</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">Order: {payment.orderId.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500">{formatDate(payment.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${payment.amount.toFixed(2)}</p>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectPayment?.(payment)}
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadInvoice(payment.id)}
                  title="Download invoice"
                >
                  <Download className="h-4 w-4" />
                </Button>

                {payment.status === 'COMPLETED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefund(payment.id)}
                    disabled={refundingId === payment.id}
                    title="Request refund"
                  >
                    {refundingId === payment.id ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}

          {pagination.total > pagination.limit && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setPagination({ ...pagination, offset: Math.max(0, pagination.offset - pagination.limit) });
                  loadPayments();
                }}
                disabled={pagination.offset === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPagination({ ...pagination, offset: pagination.offset + pagination.limit });
                  loadPayments();
                }}
                disabled={pagination.offset + pagination.limit >= pagination.total}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
