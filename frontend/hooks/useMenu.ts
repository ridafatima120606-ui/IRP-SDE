'use client';

import { useState, useCallback, useEffect } from 'react';
import { menuService, MenuItem } from '@/services/menu';

interface UseMenuOptions {
  initialCategory?: string;
  initialSearch?: string;
  limit?: number;
}

export const useMenu = (options: UseMenuOptions = {}) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    options.initialCategory
  );
  const [searchQuery, setSearchQuery] = useState(options.initialSearch || '');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [selectedMood, setSelectedMood] = useState<string | undefined>();

  // Pagination
  const [offset, setOffset] = useState(0);
  const limit = options.limit || 12;

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await menuService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch menu items with filters
  const fetchMenuItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await menuService.getMenuItems({
        category: selectedCategory,
        search: searchQuery,
        limit,
        offset,
        minPrice,
        maxPrice,
        moodTag: selectedMood
      });

      setItems(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch menu items';
      setError(message);
      console.error('Error fetching menu items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, limit, offset, minPrice, maxPrice, selectedMood]);

  // Fetch items when filters change
  useEffect(() => {
    setOffset(0); // Reset to first page when filters change
  }, [selectedCategory, searchQuery, minPrice, maxPrice, selectedMood]);

  // Fetch items when offset or dependencies change
  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const updateFilters = useCallback((filters: Partial<{
    category: string | undefined;
    search: string;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    mood: string | undefined;
  }>) => {
    if ('category' in filters) setSelectedCategory(filters.category);
    if ('search' in filters) setSearchQuery(filters.search);
    if ('minPrice' in filters) setMinPrice(filters.minPrice);
    if ('maxPrice' in filters) setMaxPrice(filters.maxPrice);
    if ('mood' in filters) setSelectedMood(filters.mood);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategory(options.initialCategory);
    setSearchQuery(options.initialSearch || '');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSelectedMood(undefined);
    setOffset(0);
  }, [options.initialCategory, options.initialSearch]);

  const goToPage = useCallback((pageNumber: number) => {
    setOffset(pageNumber * limit);
  }, [limit]);

  const hasNextPage = offset + limit < total;
  const hasPrevPage = offset > 0;
  const currentPage = Math.floor(offset / limit);
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    isLoading,
    error,
    total,
    categories,
    
    // Filters
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    selectedMood,
    
    // Filter updates
    setSelectedCategory,
    setSearchQuery,
    setMinPrice,
    setMaxPrice,
    setSelectedMood,
    updateFilters,
    resetFilters,
    
    // Pagination
    offset,
    limit,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    
    // Refetch
    refetch: fetchMenuItems
  };
};
