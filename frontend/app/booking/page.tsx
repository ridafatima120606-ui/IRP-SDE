'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, Users, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getToken } from '@/utils/auth';

interface TableBooking {
  date: string;
  time: string;
  guests: number;
  tableType?: string;
  occasion: string;
  suggestions: string;
}

export default function TableBookingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [booking, setBooking] = useState<TableBooking>({
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    guests: 2,
    occasion: '',
    suggestions: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTables, setAvailableTables] = useState<string[]>(['Window Seat', 'Corner Table', 'Private Booth', 'Center Table']);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBooking(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) : value,
    }));
  };

  const handleBookTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Please login again. Missing auth token.');
      }

      const preferredDateTime = new Date(`${booking.date}T${booking.time}:00`);
      if (Number.isNaN(preferredDateTime.getTime())) {
        throw new Error('Invalid booking date or time.');
      }

      const waitlistResponse = await fetch('http://localhost:5000/api/v1/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          guestCount: booking.guests,
          preferredTime: preferredDateTime.toISOString(),
        }),
      });

      if (!waitlistResponse.ok) {
        const err = await waitlistResponse.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to join waitlist');
      }

      const waitlistData = await waitlistResponse.json();

      localStorage.setItem('table_booking', JSON.stringify({
        ...booking,
        customer: user?.email,
        bookingId: 'BK' + Date.now(),
        status: 'CONFIRMED',
        waitlistId: waitlistData.id,
        queuePosition: waitlistData.position,
        estimatedWaitMinutes: waitlistData.estimatedWaitMinutes,
      }));

      alert(`Table request submitted. Queue position: #${waitlistData.position}. Estimated wait: ${waitlistData.estimatedWaitMinutes} minutes.`);
      router.push('/menu');
    } catch (error) {
      console.error('Booking error:', error);
      alert(error instanceof Error ? error.message : 'Failed to book table. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-orange-600">🍽️ Smart Dining</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">{user?.email}</span>
            <Link href="/auth/login" className="text-sm text-red-600 hover:text-red-700 font-semibold">
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Book Your Table
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            Reserve the perfect seating for your dining experience
          </p>
          <div className="flex items-center gap-2 text-orange-600 font-semibold">
            <span className="inline-block px-3 py-1 bg-orange-100 rounded-full text-sm">Step 1 of 3</span>
            <span>Table Reservation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleBookTable} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Select Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={booking.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 font-semibold text-gray-900"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Select Time
                </label>
                <select
                  name="time"
                  value={booking.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 font-semibold text-gray-900"
                >
                  <option value="11:00">11:00 AM - Breakfast</option>
                  <option value="12:00">12:00 PM - Lunch</option>
                  <option value="13:00">1:00 PM - Lunch</option>
                  <option value="14:00">2:00 PM - Lunch</option>
                  <option value="17:00">5:00 PM - Early Dinner</option>
                  <option value="18:00">6:00 PM - Dinner</option>
                  <option value="19:00">7:00 PM - Dinner</option>
                  <option value="20:00">8:00 PM - Late Dinner</option>
                  <option value="21:00">9:00 PM - Late Dinner</option>
                </select>
              </div>

              {/* Guest Count */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                  <Users className="w-5 h-5 text-orange-600" />
                  Number of Guests
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBooking(prev => ({ ...prev, guests: num }))}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                        booking.guests === num
                          ? 'bg-orange-600 text-white border-2 border-orange-600'
                          : 'bg-gray-100 text-gray-900 border-2 border-gray-300 hover:border-orange-400'
                      }`}
                    >
                      {num === 8 ? '8+' : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Preferred Seating
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableTables.map((table) => (
                    <button
                      key={table}
                      type="button"
                      onClick={() => setBooking(prev => ({ ...prev, tableType: table }))}
                      className={`py-3 rounded-lg font-semibold transition-all border-2 ${
                        booking.tableType === table
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-gray-50 text-gray-900 border-gray-300 hover:border-orange-400'
                      }`}
                    >
                      {table}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-3 block">
                  Occasion
                </label>
                <select
                  name="occasion"
                  value={booking.occasion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 font-semibold text-gray-900"
                >
                  <option value="">Select occasion (optional)</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Date Night">Date Night</option>
                  <option value="Family Gathering">Family Gathering</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Celebration">Celebration</option>
                  <option value="Other Event">Other Event</option>
                </select>
              </div>

              {/* Suggestions */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-3 block">
                  Suggestions
                </label>
                <textarea
                  name="suggestions"
                  value={booking.suggestions}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Share preferences, allergy notes, or anything you'd like us to prepare."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 font-semibold text-gray-900 resize-y"
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mt-8">
                <h3 className="font-bold text-gray-900 mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>📅 Date:</span>
                    <span className="font-semibold">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>🕐 Time:</span>
                    <span className="font-semibold">{booking.time}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>👥 Guests:</span>
                    <span className="font-semibold">{booking.guests} {booking.guests === 1 ? 'person' : 'people'}</span>
                  </div>
                  {booking.tableType && (
                    <div className="flex justify-between text-gray-700">
                      <span>🪑 Table:</span>
                      <span className="font-semibold">{booking.tableType}</span>
                    </div>
                  )}
                  {booking.occasion && (
                    <div className="flex justify-between text-gray-700">
                      <span>Occasion:</span>
                      <span className="font-semibold">{booking.occasion}</span>
                    </div>
                  )}
                  {booking.suggestions && (
                    <div className="text-gray-700">
                      <span className="font-semibold">Suggestions:</span>
                      <p className="mt-1">{booking.suggestions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Confirming...
                  </>
                ) : (
                  <>
                    Confirm Table Booking
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-600 text-center">
                ✅ No payment required now. Pay after ordering.
              </p>
            </form>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Why Book */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Why Reserve a Table?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-semibold">No Wait Time</p>
                    <p className="text-sm text-gray-600">Your table is ready when you arrive</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="font-semibold">Perfect Group Size</p>
                    <p className="text-sm text-gray-600">We arrange seating for your party</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-semibold">Best Location</p>
                    <p className="text-sm text-gray-600">Choose preferred seating area</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <p className="font-semibold">Special Offers</p>
                    <p className="text-sm text-gray-600">Loyalty members get exclusive deals</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
              <h4 className="font-bold text-blue-900 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Peak hours: 7-9 PM (book early)</li>
                <li>✓ Best offers: Weekday afternoons</li>
                <li>✓ Special occasions? Add a note</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

