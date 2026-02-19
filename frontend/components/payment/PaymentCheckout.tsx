'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '@/services/payment';
import { PaymentIntent } from '@/types/payment';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

interface CheckoutFormProps {
  orderId: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError?: (error: string) => void;
}

// Checkout Form Component
function CheckoutForm({ orderId, amount, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  // Create payment intent on mount
  useEffect(() => {
    const createIntent = async () => {
      try {
        const intent = await paymentService.createPaymentIntent(orderId, amount);
        if (intent) {
          setPaymentIntent(intent);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to create payment intent');
        onError?.(err.response?.data?.message || 'Failed to create payment intent');
      }
    };

    createIntent();
  }, [orderId, amount, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !paymentIntent) {
      setError('Payment system not ready');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setError('Card element not found');
        return;
      }

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {}
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
        onError?.(result.error.message || 'Payment failed');
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Confirm payment on backend
        const payment = await paymentService.confirmPayment(result.paymentIntent.id);
        if (payment?.id) {
          setSuccess(true);
          onSuccess(payment.id);
        } else {
          setError('Payment confirmed but could not retrieve payment ID');
          onError?.('Payment confirmed but could not retrieve payment ID');
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Payment processing failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Payment successful! Your order has been confirmed.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="p-4 border rounded-lg bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4'
                }
              },
              invalid: {
                color: '#fa755a'
              }
            }
          }}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Total: ${amount.toFixed(2)}
        </div>
        <Button
          type="submit"
          disabled={loading || !stripe || !paymentIntent}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay Now'
          )}
        </Button>
      </div>
    </form>
  );
}

// Main Payment Component
export function PaymentCheckout({ orderId, amount, onSuccess, onError }: CheckoutFormProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm orderId={orderId} amount={amount} onSuccess={onSuccess} onError={onError} />
      </Elements>
    </Card>
  );
}
