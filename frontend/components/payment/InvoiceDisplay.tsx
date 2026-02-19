'use client';

import { useEffect, useState } from 'react';
import { paymentService } from '@/services/payment';
import { Invoice } from '@/types/payment';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Download, X, Loader } from 'lucide-react';
import { formatDate } from '@/utils/format';

interface InvoiceProps {
  paymentId: string;
  onClose?: () => void;
}

export function InvoiceDisplay({ paymentId, onClose }: InvoiceProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [paymentId]);

  const loadInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.generateInvoice(paymentId);
      setInvoice(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await paymentService.generateInvoice(paymentId, 'pdf');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading invoice...</span>
        </div>
      </Card>
    );
  }

  if (!invoice) {
    return (
      <Card className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Failed to load invoice'}
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">Invoice</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2"
          >
            {downloading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="icon">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 mb-4">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="border-b pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Invoice ID</p>
              <p className="font-mono font-semibold">{invoice.paymentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono font-semibold">{invoice.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{formatDate(invoice.date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold">{invoice.status}</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="border-b pb-4">
          <h3 className="font-bold mb-2">Customer Information</h3>
          <p className="font-semibold">{invoice.user.name}</p>
          <p className="text-sm text-gray-600">{invoice.user.email}</p>
          {invoice.user.phone && (
            <p className="text-sm text-gray-600">{invoice.user.phone}</p>
          )}
        </div>

        {/* Items */}
        <div className="border-b pb-4">
          <h3 className="font-bold mb-3">Order Items</h3>
          <div className="space-y-2">
            {invoice.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                </div>
                <p className="font-semibold">${item.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>${invoice.totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>${invoice.totals.tax.toFixed(2)}</span>
          </div>
          {invoice.totals.serviceCharge > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Service Charge</span>
              <span>${invoice.totals.serviceCharge.toFixed(2)}</span>
            </div>
          )}
          {invoice.totals.surcharge > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Surcharge</span>
              <span>${invoice.totals.surcharge.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${invoice.totals.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="text-center text-sm text-gray-600">
          <p>Payment Method: {invoice.method}</p>
        </div>
      </div>
    </Card>
  );
}
