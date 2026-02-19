'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { useMenu } from '@/hooks/useMenu';
import { MenuItem } from '@/services/menu';
import { authService } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Home, ShoppingCart } from 'lucide-react';

export default function MenuPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [cartItems, setCartItems] = useState<MenuItem[]>([]);
  const [tableBooked, setTableBooked] = useState(false);

  const {
    items,
    categories,
    isLoading,
    error,
    total,
    selectedCategory,
    searchQuery,
    selectedMood,
    setSelectedCategory,
    setSearchQuery,
    setSelectedMood,
    resetFilters,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    limit
  } = useMenu({
    limit: 12
  });

  // Check authentication and table booking on mount
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Admin can access menu directly without table-booking gate
    if (isAdmin) {
      setTableBooked(true);
      setIsAuthenticating(false);
      return;
    }

    // Check if table is booked for non-admin users
    const booking = localStorage.getItem('table_booking');
    if (!booking) {
      router.push('/booking');
      return;
    }

    setTableBooked(true);
    setIsAuthenticating(false);
  }, [isAuthLoading, isAuthenticated, isAdmin, router]);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart_items');
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  }, []);

  const handleAddToCartWithOptions = (item: MenuItem, quantity?: number, options?: string[]) => {
    setCartItems((prev) => {
      const cartItem = {
        ...item,
        cartQuantity: quantity || 1,
        cartOptions: options || [],
      };
      const updated = [...prev, cartItem];
      localStorage.setItem('cart_items', JSON.stringify(updated));
      return updated;
    });
  };

  const handleFavorite = (_item: MenuItem) => {
    // Favorites feature placeholder
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/menu" className="text-2xl font-bold text-orange-600 hover:text-orange-700">
            🍽️ Smart Dining
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Cart Badge */}
            {cartItems.length > 0 && (
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900">{cartItems.length}</span>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-gray-700"
              >
                <Home className="w-5 h-5" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-semibold text-red-600"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Header with Badge */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-8 px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Culinary Journey</h1>
              <p className="text-orange-100">
                Explore our curated menu with mood-based recommendations
              </p>
            </div>
            {cartItems.length > 0 && (
              <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-semibold">
                  🛒 Cart: {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <MenuGrid
          items={items}
          categories={categories}
          isLoading={isLoading}
          error={error}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          selectedMood={selectedMood}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchQuery}
          onMoodChange={setSelectedMood}
          onResetFilters={resetFilters}
          onAddToCart={handleAddToCartWithOptions}
          onFavorite={handleFavorite}
          currentPage={currentPage}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onNextPage={() => goToPage(currentPage + 1)}
          onPrevPage={() => goToPage(currentPage - 1)}
          onPageChange={goToPage}
          total={total}
          limit={limit}
        />
      </div>

      {/* Checkout Section - Fixed at bottom if cart has items */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Order Summary</h3>
              <p className="text-sm text-gray-600">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} • Total: ₹{cartItems.reduce((sum, item: any) => sum + (item.price * (item.cartQuantity || 1)), 0).toFixed(2)}
              </p>
            </div>
            <Link
              href="/checkout"
              className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
            >
              💳 Proceed to Payment
            </Link>
          </div>
        </div>
      )}

      {/* Add padding to bottom to account for fixed checkout bar */}
      {cartItems.length > 0 && <div className="h-20"></div>}
      <div className="bg-white border-t border-gray-200 py-8 px-6 mt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">🌱 Sustainability</h3>
            <p className="text-sm text-gray-600">
              Look for the eco-friendly badges to find sustainable dining options that support our planet.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">😊 Mood-Based Dining</h3>
            <p className="text-sm text-gray-600">
              Filter by your mood to find dishes that match your current vibe and preferences.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">⏱️ Prep Times</h3>
            <p className="text-sm text-gray-600">
              Check the preparation time on each dish to plan your dining experience accordingly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
