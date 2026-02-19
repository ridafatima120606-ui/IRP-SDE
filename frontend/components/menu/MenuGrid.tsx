'use client';

import React, { useMemo } from 'react';
import { MenuCard } from './MenuCard';
import { MenuItem } from '@/services/menu';
import { Search, Filter, X } from 'lucide-react';

interface MenuGridProps {
  items: MenuItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  
  // Filter values
  selectedCategory?: string;
  searchQuery: string;
  selectedMood?: string;
  
  // Filter handlers
  onCategoryChange: (category: string | undefined) => void;
  onSearchChange: (query: string) => void;
  onMoodChange: (mood: string | undefined) => void;
  onResetFilters: () => void;
  
  // Item handlers
  onAddToCart?: (item: MenuItem, quantity?: number, options?: string[]) => void;
  onFavorite?: (item: MenuItem) => void;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onPageChange?: (page: number) => void;
  
  total: number;
  limit: number;
}

const MOOD_OPTIONS = [
  { value: 'romantic', label: 'Romantic' },
  { value: 'happy', label: 'Happy' },
  { value: 'calm', label: 'Calm' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'comfortable', label: 'Comfortable' },
];

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  categories,
  isLoading,
  error,
  selectedCategory,
  searchQuery,
  selectedMood,
  onCategoryChange,
  onSearchChange,
  onMoodChange,
  onResetFilters,
  onAddToCart,
  onFavorite,
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
  onPageChange,
  total,
  limit
}) => {
  const hasActiveFilters = useMemo(() => {
    return !!(selectedCategory || searchQuery || selectedMood);
  }, [selectedCategory, searchQuery, selectedMood]);

  const startIndex = currentPage * limit + 1;
  const endIndex = Math.min((currentPage + 1) * limit, total);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Menu</h1>
        <p className="text-gray-600">
          Showing {startIndex} to {endIndex} of {total} items
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search dishes by name or ingredient..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h2>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Reset All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Mood Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mood
            </label>
            <select
              value={selectedMood || ''}
              onChange={(e) => onMoodChange(e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              <option value="">All Moods</option>
              {MOOD_OPTIONS.map((mood) => (
                <option key={mood.value} value={mood.value}>
                  {mood.label}
                </option>
              ))}
            </select>
          </div>


        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error loading menu</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200 mb-8">
          <p className="text-xl text-gray-600 font-semibold mb-2">
            No items found
          </p>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search query
          </p>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Menu Items Grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {items.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onAddToCart={onAddToCart}
              onFavorite={onFavorite}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && items.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between py-8 border-t border-gray-200">
          <button
            onClick={onPrevPage}
            disabled={!hasPrevPage}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              hasPrevPage
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => onPageChange?.(i)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  currentPage === i
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={onNextPage}
            disabled={!hasNextPage}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              hasNextPage
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

