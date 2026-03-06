import apiClient from '@/utils/api';

const MENU_IMAGE_BY_NAME: Record<string, string> = {
  'Wood-Fired Margherita Pizza': '/images/menu/user-pizza.jpeg',
  'Lemon Herb Grilled Salmon': '/images/menu/user-salmon.jpeg',
};

const normalizeImagePath = (value?: string) => {
  if (!value) return '';
  const trimmed = value.trim().replace(/^[`'"]+|[`'"]+$/g, '');
  if (!trimmed) return '';
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  return `/${trimmed}`;
};

const resolveItemImage = (item: Partial<MenuItem> & { image?: string }) => {
  if (item.imageUrl) return normalizeImagePath(item.imageUrl);
  if (item.image) return normalizeImagePath(item.image);
  if (item.name && MENU_IMAGE_BY_NAME[item.name]) return normalizeImagePath(MENU_IMAGE_BY_NAME[item.name]);
  return '';
};

const normalizeMenuItem = (item: any): MenuItem => ({
  ...item,
  imageUrl: resolveItemImage(item),
  moodTags: item.moodTags || [],
  suitableFor: item.suitableFor || [],
  customizations: item.customizations || item.suitableFor || [],
  ingredients: item.ingredients || [],
  available: item.available ?? item.isAvailable ?? true,
  createdAt: item.createdAt || new Date().toISOString()
});

// Mock data for menu items when API is unavailable
const MOCK_MENU_ITEMS: MenuItem[] = [];

const MOCK_CATEGORIES = ['Drinks', 'Main Course', 'Appetizers', 'Desserts'];

const CATEGORY_ORDER: Record<string, number> = {
  APPETIZER: 0,
  APPETIZERS: 0,
  MAIN: 1,
  MAIN_COURSE: 1,
  DRINK: 2,
  DRINKS: 2,
  DESSERT: 3,
  DESSERTS: 3,
};

const getCategoryOrder = (category?: string) => {
  const key = String(category || '').toUpperCase();
  return CATEGORY_ORDER[key] ?? 99;
};

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  moodTags: string[];
  suitableFor: string[];
  customizations?: string[];
  prepTime: number;
  ingredients: string[];
  available: boolean;
  createdAt: string;
  sustainabilityMetrics?: {
    id: string;
    isVegan: boolean;
    isVegetarian: boolean;
    isLocal: boolean;
    isOrganic: boolean;
    isCarbonNeutral: boolean;
    ecoPackaging: boolean;
    isFairTrade: boolean;
    isSeasonal: boolean;
    wasteReduction: number;
  };
  sustainabilityScore?: {
    total: number;
    badges: string[];
  };
}

export interface MenuResponse {
  status: string;
  message: string;
  data: {
    total: number;
    limit: number;
    offset: number;
    items: MenuItem[];
  };
  timestamp: string;
}

export interface CategoriesResponse {
  status: string;
  message: string;
  data: {
    categories: string[];
  };
  timestamp: string;
}

export const menuService = {
  // Get all menu items with filters
  async getMenuItems(params: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
    minPrice?: number;
    maxPrice?: number;
    moodTag?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.moodTag) queryParams.append('moodTag', params.moodTag);

      const response = await apiClient.get<MenuResponse>(
        `/api/v1/menu?${queryParams.toString()}`
      );
      return {
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map(normalizeMenuItem)
        }
      };
    } catch (error: any) {
      console.error('Error fetching menu items from API, using mock data:', error);
      
      // Use mock data as fallback
      let filteredItems = [...MOCK_MENU_ITEMS];
      
      // Apply filters
      if (params.category) {
        const categoryMap: { [key: string]: string } = {
          'drinks': 'DRINKS',
          'main': 'MAIN_COURSE',
          'appetizers': 'APPETIZERS',
          'desserts': 'DESSERTS',
        };
        const categoryKey = categoryMap[params.category.toLowerCase()] || params.category.toUpperCase();
        filteredItems = filteredItems.filter(item => item.category === categoryKey);
      }
      
      if (params.search) {
        const search = params.search.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
        );
      }
      
      if (params.minPrice !== undefined) {
        filteredItems = filteredItems.filter(item => item.price >= params.minPrice!);
      }
      
      if (params.maxPrice !== undefined) {
        filteredItems = filteredItems.filter(item => item.price <= params.maxPrice!);
      }
      
      if (params.moodTag) {
        const mood = params.moodTag.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.moodTags.some(tag => tag.toLowerCase().includes(mood))
        );
      }

      // Display order: Appetizers -> Main -> Drinks -> Desserts
      filteredItems.sort((a, b) => {
        const categoryDiff = getCategoryOrder(a.category) - getCategoryOrder(b.category);
        if (categoryDiff !== 0) return categoryDiff;
        return String(a.name || '').localeCompare(String(b.name || ''));
      });
      
      const total = filteredItems.length;
      const offset = params.offset || 0;
      const limit = params.limit || 12;
      const paginatedItems = filteredItems.slice(offset, offset + limit);
      
      return {
        status: 'success',
        message: 'Using mock data - API unavailable',
        data: {
          total,
          limit,
          offset,
          items: paginatedItems
        },
        timestamp: new Date().toISOString()
      };
    }
  },

  // Get single menu item by ID
  async getMenuItemById(id: string) {
    try {
      const response = await apiClient.get<{
        status: string;
        message: string;
        data: MenuItem;
      }>(`/api/v1/menu/${id}`);
      return normalizeMenuItem(response.data);
    } catch (error: any) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  },

  // Get all menu categories
  async getCategories() {
    try {
      const response = await apiClient.get<CategoriesResponse>('/api/v1/menu/categories');
      return response.data.categories;
    } catch (error: any) {
      console.error('Error fetching categories from API, using mock data:', error);
      // Return mock categories as fallback
      return MOCK_CATEGORIES;
    }
  },

  // Get menu items by category
  async getByCategory(category: string) {
    try {
      const response = await apiClient.get<MenuResponse>(
        `/api/v1/menu/category/${category.toUpperCase()}`
      );
      return response.data.items.map(normalizeMenuItem);
    } catch (error: any) {
      console.error('Error fetching items by category from API, using mock data:', error);
      // Return filtered mock items as fallback
      return MOCK_MENU_ITEMS
        .filter(item => item.category === category.toUpperCase())
        .map(normalizeMenuItem);
    }
  },

  // Admin: create menu item
  async createMenuItem(payload: Partial<MenuItem>) {
    const apiPayload = {
      ...payload,
      image: payload.imageUrl || undefined,
    };
    try {
      const response = await apiClient.post<{
        status: string;
        message: string;
        data: any;
      }>('/api/v1/menu', apiPayload);
      const created = normalizeMenuItem(response.data);
      const exists = MOCK_MENU_ITEMS.some((item) => item.id === created.id);
      if (!exists) {
        MOCK_MENU_ITEMS.unshift(created);
      }
      return created;
    } catch (error: any) {
      console.error('Failed to create menu item:', error);
      throw error;
    }
  },

  // Admin: update menu item
  async updateMenuItem(id: string, payload: Partial<MenuItem>) {
    const apiPayload = {
      ...payload,
      image: payload.imageUrl || undefined,
    };
    try {
      const response = await apiClient.put<{
        status: string;
        message: string;
        data: any;
      }>(`/api/v1/menu/${id}`, apiPayload);
      const updated = normalizeMenuItem(response.data);
      const index = MOCK_MENU_ITEMS.findIndex((item) => item.id === id);
      if (index !== -1) {
        MOCK_MENU_ITEMS[index] = {
          ...MOCK_MENU_ITEMS[index],
          ...updated,
        };
      }
      return updated;
    } catch (error: any) {
      console.error('Failed to update menu item:', error);
      throw error;
    }
  },

  // Admin: toggle item availability
  async toggleAvailability(id: string, available: boolean) {
    try {
      const response = await apiClient.patch<{
        status: string;
        message: string;
        data: { id: string; name: string; isAvailable: boolean };
      }>(`/api/v1/menu/${id}/availability`, { available });
      const index = MOCK_MENU_ITEMS.findIndex((item) => item.id === id);
      if (index !== -1) {
        MOCK_MENU_ITEMS[index] = {
          ...MOCK_MENU_ITEMS[index],
          available,
        };
      }
      return response.data;
    } catch (error: any) {
      console.error('Failed to toggle availability:', error);
      throw error;
    }
  },

  // Admin: delete menu item
  async deleteMenuItem(id: string) {
    try {
      await apiClient.delete(`/api/v1/menu/${id}`);
      const index = MOCK_MENU_ITEMS.findIndex((item) => item.id === id);
      if (index !== -1) {
        MOCK_MENU_ITEMS.splice(index, 1);
      }
    } catch (error: any) {
      console.error('Failed to delete menu item:', error);
      throw error;
    }
  },

  // Admin: bulk upload menu items via CSV content
  async bulkUploadCsv(csvData: string) {
    try {
      const response = await apiClient.post<{
        status: string;
        message: string;
        data: {
          totalRows: number;
          created: number;
          updated: number;
          skipped: number;
          errors: Array<{ row: number; message: string }>;
        };
      }>('/api/v1/menu/bulk-upload', { csvData });
      return response.data;
    } catch (error: any) {
      console.error('Failed to bulk upload menu CSV:', error);
      throw error;
    }
  }
};

