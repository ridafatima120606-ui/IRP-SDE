import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticatedRequest } from '../types';
import { calculateSustainabilityScore } from '../algorithms/sustainabilityScore';
import { mockMenuItems, persistMockMenuItems } from '../utils/mockData';

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

const normalizeStringArray = (values: unknown): string[] => {
  if (!Array.isArray(values)) return [];
  return values
    .map((tag) => String(tag).trim())
    .filter(Boolean);
};

const getCategoryOrder = (category?: string) => {
  const key = String(category || '').toUpperCase();
  return CATEGORY_ORDER[key] ?? 99;
};

// Get all menu items with filters and pagination
export const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const { category, search, limit = 20, offset = 0, minPrice, maxPrice, moodTag } = req.query;

    // Use mock data
    let items = [...mockMenuItems];

    // Apply filters
    if (category) {
      items = items.filter(item => item.category === String(category).toUpperCase());
    }

    if (search) {
      const searchTerm = String(search).toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }

    if (minPrice || maxPrice) {
      if (minPrice) {
        items = items.filter(item => item.price >= parseFloat(String(minPrice)));
      }
      if (maxPrice) {
        items = items.filter(item => item.price <= parseFloat(String(maxPrice)));
      }
    }

    if (moodTag) {
      const mood = String(moodTag).trim().toLowerCase();
      items = items.filter((item) =>
        (item.moodTags || []).some((tag) => String(tag).toLowerCase().includes(mood))
      );
    }

    // Display order: Appetizers -> Main -> Drinks -> Desserts
    items.sort((a, b) => {
      const categoryDiff = getCategoryOrder(a.category) - getCategoryOrder(b.category);
      if (categoryDiff !== 0) return categoryDiff;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

    const total = items.length;

    // Apply pagination
    const paginatedItems = items.slice(
      parseInt(String(offset)),
      parseInt(String(offset)) + parseInt(String(limit))
    );

    res.status(200).json({
      status: 'OK',
      message: 'Menu items retrieved successfully',
      data: {
        total,
        limit: parseInt(String(limit)),
        offset: parseInt(String(offset)),
        items: paginatedItems
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch menu items',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get single menu item by ID
export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = mockMenuItems.find(item => item.id === id);

    if (!item) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Menu item not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status: 'OK',
      message: 'Menu item retrieved successfully',
      data: item,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch menu item',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Create new menu item (Admin only)
export const createMenuItem = async (req: authenticatedRequest, res: Response) => {
  try {
    const { name, description, price, category, image, moodTags, suitableFor, customizations, prepTime } = req.body;
    const normalizedMoodTags = normalizeStringArray(moodTags);
    const normalizedSuitableFor = normalizeStringArray(suitableFor);
    const normalizedCustomizations = normalizeStringArray(customizations);
    const resolvedSuitableFor =
      normalizedSuitableFor.length > 0 ? normalizedSuitableFor : normalizedCustomizations;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'price', message: 'Price is required' },
          { field: 'category', message: 'Category is required' }
        ],
        timestamp: new Date().toISOString()
      });
    }

    let newItem: any;
    try {
      newItem = await prisma.menuItem.create({
        data: {
          name,
          description: description || '',
          price: parseFloat(String(price)),
          category: String(category).toUpperCase(),
          image: image || '',
          moodTags: normalizedMoodTags,
          suitableFor: resolvedSuitableFor,
          prepTime: prepTime || 15
        }
      });
      const existsInMock = mockMenuItems.some((item: any) => item.id === newItem.id);
      if (!existsInMock) {
        mockMenuItems.unshift({
          ...newItem,
          customizations: normalizedCustomizations,
          available: newItem.isAvailable,
        });
      }
    } catch {
      newItem = {
        id: `mock-${Date.now()}`,
        name,
        description: description || '',
        price: parseFloat(String(price)),
        category: String(category).toUpperCase(),
        image: image || '',
        moodTags: normalizedMoodTags,
        suitableFor: resolvedSuitableFor,
        customizations: normalizedCustomizations,
        prepTime: prepTime || 15,
        available: req.body.available ?? true,
        createdAt: new Date().toISOString()
      };
      mockMenuItems.unshift(newItem);
      persistMockMenuItems();
    }

    res.status(201).json({
      status: 'OK',
      message: 'Menu item created successfully',
      data: newItem,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create menu item',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Update menu item (Admin only)
export const updateMenuItem = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, moodTags, suitableFor, customizations, prepTime } = req.body;
    const normalizedMoodTags = normalizeStringArray(moodTags);
    const normalizedSuitableFor = normalizeStringArray(suitableFor);
    const normalizedCustomizations = normalizeStringArray(customizations);
    const resolvedSuitableFor =
      suitableFor !== undefined
        ? normalizedSuitableFor
        : normalizedCustomizations.length > 0
          ? normalizedCustomizations
          : normalizedSuitableFor;

    let updatedItem: any;
    let score: any = null;
    try {
      // Check if item exists
      const existingItem = await prisma.menuItem.findUnique({ where: { id } });
      if (!existingItem) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Menu item not found',
          timestamp: new Date().toISOString()
        });
      }

      updatedItem = await prisma.menuItem.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(price && { price: parseFloat(String(price)) }),
          ...(category && { category: String(category).toUpperCase() }),
          ...(image !== undefined && { image }),
          ...(moodTags !== undefined && { moodTags: normalizedMoodTags }),
          ...((suitableFor !== undefined || customizations !== undefined) && { suitableFor: resolvedSuitableFor }),
          ...(prepTime && { prepTime })
        },
        include: {
          sustainability: true
        }
      });

      score = updatedItem.sustainability
        ? calculateSustainabilityScore(updatedItem.sustainability)
        : null;
      const index = mockMenuItems.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        mockMenuItems[index] = {
          ...mockMenuItems[index],
          ...updatedItem,
          customizations: customizations !== undefined ? normalizedCustomizations : (mockMenuItems[index] as any).customizations,
          available: updatedItem.isAvailable,
        };
      } else {
        mockMenuItems.unshift({
          ...updatedItem,
          customizations: normalizedCustomizations,
          available: updatedItem.isAvailable,
        });
      }
      persistMockMenuItems();
    } catch {
      const index = mockMenuItems.findIndex((item: any) => item.id === id);
      if (index === -1) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Menu item not found',
          timestamp: new Date().toISOString()
        });
      }

      updatedItem = {
        ...mockMenuItems[index],
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(String(price)) }),
        ...(category && { category: String(category).toUpperCase() }),
        ...(image !== undefined && { image }),
        ...(moodTags !== undefined && { moodTags: normalizedMoodTags }),
        ...((suitableFor !== undefined || customizations !== undefined) && { suitableFor: resolvedSuitableFor }),
        ...(customizations !== undefined && { customizations: normalizedCustomizations }),
        ...(prepTime && { prepTime })
      };
      mockMenuItems[index] = updatedItem;
      persistMockMenuItems();
    }

    res.status(200).json({
      status: 'OK',
      message: 'Menu item updated successfully',
      data: {
        ...updatedItem,
        sustainabilityScore: score
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update menu item',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Delete menu item (Admin only)
export const deleteMenuItem = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    try {
      // Check if item exists
      const existingItem = await prisma.menuItem.findUnique({ where: { id } });
      if (!existingItem) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Menu item not found',
          timestamp: new Date().toISOString()
        });
      }
      await prisma.menuItem.delete({ where: { id } });
      const index = mockMenuItems.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        mockMenuItems.splice(index, 1);
        persistMockMenuItems();
      }
    } catch {
      const index = mockMenuItems.findIndex((item: any) => item.id === id);
      if (index === -1) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Menu item not found',
          timestamp: new Date().toISOString()
        });
      }
      mockMenuItems.splice(index, 1);
      persistMockMenuItems();
    }

    res.status(200).json({
      status: 'OK',
      message: 'Menu item deleted successfully',
      data: { id },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete menu item',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get menu items by category
export const getMenuByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    let itemsWithScores: any[] = [];
    let total = 0;
    try {
      const items = await prisma.menuItem.findMany({
        where: {
          category: String(category).toUpperCase(),
          isAvailable: true
        },
        skip: parseInt(String(offset)),
        take: parseInt(String(limit)),
        include: {
          sustainability: true
        }
      });

      total = await prisma.menuItem.count({
        where: {
          category: String(category).toUpperCase(),
          isAvailable: true
        }
      });

      itemsWithScores = items.map(item => {
        const score = item.sustainability
          ? calculateSustainabilityScore(item.sustainability)
          : null;

        return {
          ...item,
          sustainabilityScore: score
        };
      });
    } catch {
      const filtered = mockMenuItems.filter((item: any) => {
        const itemCategory = String(item.category || '').toUpperCase();
        const itemAvailable = item.available ?? item.isAvailable ?? true;
        return itemCategory === String(category).toUpperCase() && itemAvailable;
      });
      total = filtered.length;
      itemsWithScores = filtered.slice(
        parseInt(String(offset)),
        parseInt(String(offset)) + parseInt(String(limit))
      );
    }

    res.status(200).json({
      status: 'OK',
      message: `Menu items in ${category} category retrieved successfully`,
      data: {
        category,
        total,
        items: itemsWithScores
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching category menu:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch menu items by category',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    let categoryList: string[] = [];
    try {
      const categories = await prisma.menuItem.findMany({
        distinct: ['category'],
        select: { category: true }
      });
      categoryList = categories.map(c => c.category).filter(Boolean);
    } catch {
      categoryList = Array.from(
        new Set(mockMenuItems.map((item: any) => String(item.category || '').toUpperCase()))
      ).filter(Boolean);
    }

    res.status(200).json({
      status: 'OK',
      message: 'Categories retrieved successfully',
      data: {
        categories: categoryList,
        total: categoryList.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Toggle menu item availability
export const toggleAvailability = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    if (available === undefined) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [{ field: 'available', message: 'Available status is required' }],
        timestamp: new Date().toISOString()
      });
    }

    let updatedItem: any;
    try {
      updatedItem = await prisma.menuItem.update({
        where: { id },
        data: { isAvailable: available },
        include: {
          sustainability: true
        }
      });
      const index = mockMenuItems.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        mockMenuItems[index] = {
          ...mockMenuItems[index],
          available,
          isAvailable: available,
        };
        persistMockMenuItems();
      }
    } catch {
      const index = mockMenuItems.findIndex((item: any) => item.id === id);
      if (index === -1) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Menu item not found',
          timestamp: new Date().toISOString()
        });
      }
      updatedItem = {
        ...mockMenuItems[index],
        available,
        isAvailable: available
      };
      mockMenuItems[index] = updatedItem;
      persistMockMenuItems();
    }

    res.status(200).json({
      status: 'OK',
      message: 'Menu item availability updated successfully',
      data: {
        id,
        name: updatedItem.name,
        isAvailable: updatedItem.isAvailable
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error toggling availability:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update availability',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};
