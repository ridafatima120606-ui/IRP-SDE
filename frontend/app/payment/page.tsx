'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Loader } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  cartQuantity?: number;
}

interface CheckoutAdjustments {
  useLoyaltyPoints?: boolean;
  loyaltyPointsUsed?: number;
  hasCoupon?: boolean;
  couponCode?: string;
  couponRate?: number;
  couponDiscount?: number;
  subtotalBeforeDiscount?: number;
  totalDiscount?: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [adjustments, setAdjustments] = useState<CheckoutAdjustments>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('cart_items');
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
    const savedAdjustments = localStorage.getItem('checkout_adjustments');
    if (savedAdjustments) {
      setAdjustments(JSON.parse(savedAdjustments));
    }
    setIsLoading(false);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.price * (item.cartQuantity || 1);
  }, 0);

  const pointsDiscount = Number(adjustments.loyaltyPointsUsed || 0);
  const couponDiscount = Number(adjustments.couponDiscount || 0);
  const totalDiscount = Math.max(0, pointsDiscount + couponDiscount);
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const tax = discountedSubtotal * 0.05;
  const total = discountedSubtotal + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch('http://localhost:5000/api/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(total.toFixed(2)),
          currency: 'INR',
          method: paymentMethod,
          customer: {
            name: formData.cardName,
            email: formData.email,
            phone: formData.phone,
          },
          items: cartItems.map((item) => ({
            itemId: item.id,
            quantity: item.cartQuantity || 1,
            price: item.price,
          })),
          discounts: {
            loyaltyPointsUsed: pointsDiscount,
            couponCode: adjustments.couponCode || '',
            couponDiscount,
            totalDiscount,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        alert(err.message || 'Payment failed. Please try again.');
        return;
      }

      const result = await response.json();
      localStorage.removeItem('cart_items');
      localStorage.removeItem('checkout_adjustments');

      alert(`Payment successful. Order ID: ${result?.data?.id || 'N/A'}`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/checkout"
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Checkout
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <form onSubmit={handlePayment} className="space-y-6">
                <div>
                  <h2 className="font-bold text-lg text-gray-900 mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    <label
                      className="flex items-center p-4 border-2 rounded-lg cursor-pointer"
                      style={{ borderColor: paymentMethod === 'card' ? '#ea580c' : '#d1d5db' }}
                    >
                      <input
                        type="radio"
                        name="method"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 flex items-center gap-2 font-semibold text-gray-900">
                        <CreditCard className="w-5 h-5" />
                        Credit/Debit Card
                      </span>
                    </label>
                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                      <input
                        type="radio"
                        name="method"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 font-semibold text-gray-900">UPI</span>
                    </label>
                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                      <input
                        type="radio"
                        name="method"
                        value="netbanking"
                        checked={paymentMethod === 'netbanking'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 font-semibold text-gray-900">Net Banking</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          name="expiry"
                          value={formData.expiry}
                          onChange={handleInputChange}
                          placeholder="12/25"
                          maxLength={5}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={4}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay Rs {total.toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="font-bold text-lg text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-700">
                    <span>
                      {item.name} x{item.cartQuantity || 1}
                    </span>
                    <span className="font-semibold">
                      Rs {(item.price * (item.cartQuantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rs {subtotal.toFixed(2)}</span>
                </div>
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Loyalty points</span>
                    <span className="font-semibold">-Rs {pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Coupon ({adjustments.couponCode || '-'})</span>
                    <span className="font-semibold">-Rs {couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax (5%)</span>
                  <span className="font-semibold">Rs {tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="font-bold text-orange-600 text-2xl">Rs {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
