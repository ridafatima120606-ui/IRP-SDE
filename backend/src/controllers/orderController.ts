import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticatedRequest } from '../types';
import { io } from '../index';
import { mockDatabase } from '../utils/mockDatabase';

// Create order
export const createOrder = async (req: authenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { items, tableId, notes, isDelivery = false } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [{ field: 'items', message: 'At least one item is required' }],
        timestamp: new Date().toISOString()
      });
    }

    // Validate items exist and calculate total
    let totalPrice = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });

      if (!menuItem) {
        return res.status(404).json({
          status: 'ERROR',
          message: `Menu item ${item.menuItemId} not found`,
          timestamp: new Date().toISOString()
        });
      }

      const itemTotal = menuItem.price * (item.quantity || 1);
      totalPrice += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity || 1,
        specialInstructions: item.specialInstructions || '',
        price: menuItem.price
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        tableId: tableId || undefined,
        totalPrice,
        specialInstructions: notes || '',
        orderStatus: 'CONFIRMED'
      },
      include: {
        user: { select: { id: true, name: true } },
        items: true
      }
    });

    // Create order items
    for (const item of orderItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialRequest: item.specialInstructions
        }
      });
    }

    // Broadcast order to kitchen via WebSocket
    io.emit('order:new', {
      orderId: order.id,
      items: orderItems,
      status: 'CONFIRMED',
      createdAt: order.createdAt
    });

    res.status(201).json({
      status: 'OK',
      message: 'Order created successfully',
      data: {
        order
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create order',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Order not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status: 'OK',
      message: 'Order retrieved successfully',
      data: order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch order',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get user's orders
export const getUserOrders = async (req: authenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, limit = 20, offset = 0 } = req.query;

    const where: any = { userId };

    if (status) {
      where.orderStatus = String(status).toUpperCase();
    }

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      skip: parseInt(String(offset)),
      take: parseInt(String(limit)),
      include: {
        user: { select: { id: true, name: true } },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'OK',
      message: 'User orders retrieved successfully',
      data: {
        total,
        limit: parseInt(String(limit)),
        offset: parseInt(String(offset)),
        orders
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch orders',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get all orders (Admin/Kitchen only)
export const getAllOrders = async (req: authenticatedRequest, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where: any = {};

    if (status) {
      where.orderStatus = String(status).toUpperCase();
    }

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      skip: parseInt(String(offset)),
      take: parseInt(String(limit)),
      include: {
        user: { select: { id: true, name: true } },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'OK',
      message: 'All orders retrieved successfully',
      data: {
        total,
        limit: parseInt(String(limit)),
        offset: parseInt(String(offset)),
        orders
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isDbConnectionError = errorMessage.includes("Can't reach database server");

    if (isDbConnectionError) {
      const { status } = req.query;
      const allMockOrders = mockDatabase.getAllOrders();
      const filteredMockOrders = status
        ? allMockOrders.filter((order) => order.status === String(status).toUpperCase())
        : allMockOrders;

      const normalizedOrders = filteredMockOrders.map((order) => ({
        id: order.id,
        userId: order.userId,
        user: { id: order.userId, name: 'Demo Customer' },
        items: order.items.map((item, index) => {
          const menuItem = mockDatabase.getMenuItemById(item.menuItemId);
          return {
            id: `${order.id}-${index}`,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialRequest: '',
            menuItem: {
              id: item.menuItemId,
              name: menuItem?.name || 'Custom Item',
              price: item.price,
              category: menuItem?.category || 'GENERAL'
            }
          };
        }),
        orderStatus: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
        tableId: null,
        totalPrice: order.totalAmount,
        specialInstructions: '',
        createdAt: order.createdAt
      }));

      return res.status(200).json({
        status: 'OK',
        message: 'All orders retrieved successfully (mock fallback)',
        data: {
          total: normalizedOrders.length,
          limit: normalizedOrders.length,
          offset: 0,
          orders: normalizedOrders
        },
        timestamp: new Date().toISOString()
      });
    }

    console.error('Error fetching all orders:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch orders',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

// Update order status
export const updateOrderStatus = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];

    if (!status || !validStatuses.includes(String(status).toUpperCase())) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [{
          field: 'status',
          message: `Status must be one of: ${validStatuses.join(', ')}`
        }],
        timestamp: new Date().toISOString()
      });
    }

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Order not found',
        timestamp: new Date().toISOString()
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: String(status).toUpperCase() as any
      },
      include: {
        user: { select: { id: true, name: true } },
        items: true
      }
    });

    // Broadcast status update via WebSocket
    io.emit('order:status', {
      orderId: id,
      status: updatedOrder.orderStatus,
      updatedAt: new Date()
    });

    res.status(200).json({
      status: 'OK',
      message: 'Order status updated successfully',
      data: updatedOrder,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isDbConnectionError = errorMessage.includes("Can't reach database server");

    if (isDbConnectionError) {
      const { id } = req.params;
      const { status } = req.body;
      const normalizedStatus = String(status).toUpperCase();
      const updatedMockOrder = mockDatabase.updateOrderStatus(
        id,
        normalizedStatus === 'CONFIRMED' ? 'PENDING' : normalizedStatus
      );

      if (!updatedMockOrder) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Order not found',
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        status: 'OK',
        message: 'Order status updated successfully (mock fallback)',
        data: {
          id: updatedMockOrder.id,
          orderStatus: normalizedStatus
        },
        timestamp: new Date().toISOString()
      });
    }

    console.error('Error updating order status:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update order status',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

// Add items to existing order
export const addItemsToOrder = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [{ field: 'items', message: 'At least one item is required' }],
        timestamp: new Date().toISOString()
      });
    }

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Order not found',
        timestamp: new Date().toISOString()
      });
    }

    if (!['CONFIRMED', 'PREPARING'].includes(order.orderStatus)) {
      return res.status(409).json({
        status: 'ERROR',
        message: `Cannot add items to ${order.orderStatus} order`,
        timestamp: new Date().toISOString()
      });
    }

    // Add new items to existing order
    let additionalPrice = 0;
    const newItems: any[] = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });

      if (!menuItem) {
        return res.status(404).json({
          status: 'ERROR',
          message: `Menu item ${item.menuItemId} not found`,
          timestamp: new Date().toISOString()
        });
      }

      additionalPrice += menuItem.price * (item.quantity || 1);

      newItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity || 1,
        price: menuItem.price,
        specialInstructions: item.specialInstructions || ''
      });
    }

    // Create new order items
    for (const item of newItems) {
      await prisma.orderItem.create({
        data: {
          orderId: id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialRequest: item.specialInstructions
        }
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        totalPrice: order.totalPrice + additionalPrice
      },
      include: {
        user: { select: { id: true, name: true } },
        items: true
      }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Items added to order successfully',
      data: updatedOrder,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding items to order:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to add items to order',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Cancel order
export const cancelOrder = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Order not found',
        timestamp: new Date().toISOString()
      });
    }

    if (order.orderStatus === 'SERVED' || order.orderStatus === 'CANCELLED') {
      return res.status(409).json({
        status: 'ERROR',
        message: `Cannot cancel ${order.orderStatus} order`,
        timestamp: new Date().toISOString()
      });
    }

    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: { orderStatus: 'CANCELLED' },
      include: {
        user: { select: { id: true, name: true } },
        items: true
      }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Order cancelled successfully',
      data: {
        order: cancelledOrder,
        reason: reason || 'Not specified'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to cancel order',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};


