'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  cartQuantity?: number;
  cartOptions?: string[];
  description?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [loyaltyPointsInput, setLoyaltyPointsInput] = useState('');
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('cart_items');
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const handleRemoveItem = (itemId: string) => {
    const updated = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updated);
    localStorage.setItem('cart_items', JSON.stringify(updated));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const updated = cartItems.map((item) =>
      item.id === itemId ? { ...item, cartQuantity: quantity } : item
    );
    setCartItems(updated);
    localStorage.setItem('cart_items', JSON.stringify(updated));
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.price * (item.cartQuantity || 1);
  }, 0);

  const requestedPoints = Math.max(0, Number(loyaltyPointsInput) || 0);
  const pointsDiscount = useLoyaltyPoints ? Math.min(requestedPoints, subtotal) : 0;

  const couponDiscountRateMap: Record<string, number> = {
    SAVE10: 0.1,
    WELCOME15: 0.15,
    FESTIVE20: 0.2,
  };
  const normalizedCoupon = couponCode.trim().toUpperCase();
  const couponRate = hasCoupon ? couponDiscountRateMap[normalizedCoupon] || 0 : 0;
  const couponDiscount = (subtotal - pointsDiscount) * couponRate;

  const totalDiscount = pointsDiscount + couponDiscount;
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const tax = discountedSubtotal * 0.05;
  const total = discountedSubtotal + tax;

  const handleProceedToPayment = () => {
    localStorage.setItem(
      'checkout_adjustments',
      JSON.stringify({
        useLoyaltyPoints,
        loyaltyPointsUsed: pointsDiscount,
        hasCoupon,
        couponCode: normalizedCoupon,
        couponRate,
        couponDiscount,
        subtotalBeforeDiscount: subtotal,
        totalDiscount,
      })
    );
    router.push('/payment');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/menu"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </Link>

          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">Cart</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some items to get started.</p>
            <Link
              href="/menu"
              className="inline-block px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/menu"
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Menu
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Order Review</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                        {item.cartOptions && item.cartOptions.length > 0 && (
                          <div className="mb-3 text-sm text-gray-700">
                            <p className="font-semibold text-xs text-gray-600">Options:</p>
                            <p className="text-gray-600">{item.cartOptions.join(', ')}</p>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-xl text-orange-600 mb-4">
                          Rs {(item.price * (item.cartQuantity || 1)).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1.5 justify-center mb-3">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, (item.cartQuantity || 1) - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold text-sm"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900 text-sm">
                            {item.cartQuantity || 1}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, (item.cartQuantity || 1) + 1)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold text-sm"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors font-semibold text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="font-bold text-lg text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rs {subtotal.toFixed(2)}</span>
                </div>
                {useLoyaltyPoints && pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Loyalty points</span>
                    <span className="font-semibold">-Rs {pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                {hasCoupon && couponRate > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Coupon ({normalizedCoupon})</span>
                    <span className="font-semibold">-Rs {couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax (5%)</span>
                  <span className="font-semibold">Rs {tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <input
                      type="checkbox"
                      checked={useLoyaltyPoints}
                      onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                    />
                    Do you have loyalty points?
                  </label>
                  {useLoyaltyPoints && (
                    <input
                      type="number"
                      min="0"
                      value={loyaltyPointsInput}
                      onChange={(e) => setLoyaltyPointsInput(e.target.value)}
                      placeholder="Enter points to use"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <input
                      type="checkbox"
                      checked={hasCoupon}
                      onChange={(e) => setHasCoupon(e.target.checked)}
                    />
                    Do you have a coupon?
                  </label>
                  {hasCoupon && (
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code (e.g. SAVE10)"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-between mb-8 text-lg">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-orange-600 text-2xl">Rs {total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full block text-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
              >
                Proceed to Payment
              </button>

              <Link
                href="/menu"
                className="w-full block text-center mt-3 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
