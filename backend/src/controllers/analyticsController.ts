import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticatedRequest } from '../types';

/**
 * GET /api/v1/analytics/dashboard/overview
 * Get dashboard overview with key metrics
 */
export const getDashboardOverview = async (req: authenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Total revenue
    const paymentStats = await prisma.payment.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'COMPLETED'
      },
      _sum: { amount: true },
      _count: true
    });

    // Total orders
    const orderStats = await prisma.order.aggregate({
      where: {
        createdAt: { gte: start, lte: end }
      },
      _count: true
    });

    // Total customers (unique users that made orders)
    const uniqueCustomers = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      select: { userId: true },
      distinct: ['userId']
    });

    // Average order value
    const avgOrderValue = paymentStats._count > 0 ? (paymentStats._sum.amount || 0) / paymentStats._count : 0;

    // Most ordered item
    const topItem = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          createdAt: { gte: start, lte: end }
        }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1
    });

    // Table utilization
    const reservationStats = await prisma.reservation.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'COMPLETED'
      },
      _count: true
    });

    const totalTables = await prisma.table.count();
    const tableUtilization = totalTables > 0 ? (reservationStats._count / totalTables) : 0;

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Dashboard overview retrieved successfully',
      data: {
        dateRange: { start, end },
        revenue: {
          total: paymentStats._sum.amount || 0,
          transactions: paymentStats._count,
          average: avgOrderValue
        },
        orders: {
          total: orderStats._count,
          average: orderStats._count > 0 ? (paymentStats._sum.amount || 0) / orderStats._count : 0
        },
        customers: {
          total: uniqueCustomers.length,
          returning: 0 // Could calculate from repeat purchases
        },
        tables: {
          total: totalTables,
          utilization: Math.round(tableUtilization * 100)
        },
        topItem: topItem[0] ? topItem[0].menuItemId : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to retrieve dashboard overview',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /api/v1/analytics/sales/by-date
 * Get sales analytics by date
 */
export const getSalesByDate = async (req: authenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'COMPLETED'
      },
      select: {
        amount: true,
        createdAt: true,
        method: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by specified period
    interface GroupedSales {
      [key: string]: {
        date: string;
        revenue: number;
        transactions: number;
        methods: { [key: string]: number };
      };
    }

    const grouped: GroupedSales = {};

    payments.forEach((payment) => {
      let key = '';

      if (groupBy === 'day') {
        key = payment.createdAt.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const date = new Date(payment.createdAt);
        const week = Math.ceil((date.getDate() - date.getDay()) / 7);
        key = `${date.getFullYear()}-W${week}`;
      } else if (groupBy === 'month') {
        key = payment.createdAt.toISOString().substring(0, 7);
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          revenue: 0,
          transactions: 0,
          methods: {}
        };
      }

      grouped[key].revenue += payment.amount;
      grouped[key].transactions += 1;
      grouped[key].methods[payment.method] = (grouped[key].methods[payment.method] || 0) + 1;
    });

    const data = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Sales by date retrieved successfully',
      data,
      metadata: {
        totalSales: payments.reduce((sum, p) => sum + p.amount, 0),
        totalTransactions: payments.length,
        groupBy
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Sales by date error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to retrieve sales data',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /api/v1/analytics/sales/by-category
 * Get sales analytics by menu category
 */
export const getSalesByCategory = async (req: authenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const categoryStats = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          createdAt: { gte: start, lte: end }
        }
      },
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    // Get menu items with categories
    const items = await prisma.menuItem.findMany({
      where: {
        id: { in: categoryStats.map((s) => s.menuItemId) }
      },
      select: { id: true, name: true, category: true, price: true }
    });

    const data = categoryStats.map((stat) => {
      const item = items.find((i) => i.id === stat.menuItemId);
      return {
        category: item?.category || 'Unknown',
        itemName: item?.name || 'Unknown',
        quantity: stat._sum.quantity || 0,
        orders: stat._count.id,
        revenue: ((stat._sum.quantity || 0) * (item?.price || 0))
      };
    });

    // Group by category
    interface CategorySales {
      [key: string]: {
        category: string;
        revenue: number;
        quantity: number;
        orders: number;
        items: Array<{
          name: string;
          quantity: number;
          revenue: number;
        }>;
      };
    }

    const grouped: CategorySales = {};

    data.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = {
          category: item.category,
          revenue: 0,
          quantity: 0,
          orders: 0,
          items: []
        };
      }

      grouped[item.category].revenue += item.revenue;
      grouped[item.category].quantity += item.quantity;
      grouped[item.category].orders += item.orders;
      grouped[item.category].items.push({
        name: item.itemName,
        quantity: item.quantity,
        revenue: item.revenue
      });
    });

    const categoryData = Object.values(grouped).sort((a, b) => b.revenue - a.revenue);

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Sales by category retrieved successfully',
      data: categoryData,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Sales by category error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to retrieve category sales',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /api/v1/analytics/peak-hours
 * Get peak hours analysis
 */
export const getPeakHours = async (req: authenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      select: {
        createdAt: true,
        totalPrice: true
      }
    });

    // Group by hour
    interface HourlyData {
      [hour: number]: {
        hour: number;
        orders: number;
        revenue: number;
        avgOrderValue: number;
      };
    }

    const hourlyData: HourlyData = {};

    for (let i = 0; i < 24; i++) {
      hourlyData[i] = { hour: i, orders: 0, revenue: 0, avgOrderValue: 0 };
    }

    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue += order.totalPrice;
    });

    // Calculate averages
    Object.keys(hourlyData).forEach((hourStr) => {
      const hour = parseInt(hourStr);
      if (hourlyData[hour].orders > 0) {
        hourlyData[hour].avgOrderValue = hourlyData[hour].revenue / hourlyData[hour].orders;
      }
    });

    const data = Object.values(hourlyData);

    // Find peak hours
    const peakHours = data
      .filter((h) => h.orders > 0)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Peak hours analysis retrieved successfully',
      data: {
        hourlyBreakdown: data,
        peakHours,
        totalOrders: orders.length,
        avgOrdersPerHour: Math.round(orders.length / 24)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Peak hours error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to retrieve peak hours data',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /api/v1/analytics/top-items
 * Get top selling menu items
 */
export const getTopItems = async (req: authenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate, limit = '10' } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const topItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          createdAt: { gte: start, lte: end }
        }
      },
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: parseInt(limit as string)
    });

    // Get menu item details
    const items = await prisma.menuItem.findMany({
      where: {
        id: { in: topItems.map((item) => item.menuItemId) }
      }
    });

    const data = topItems.map((item) => {
      const menuItem = items.find((m) => m.id === item.menuItemId);
      return {
        itemId: item.menuItemId,
        name: menuItem?.name || 'Unknown',
        category: menuItem?.category || 'Unknown',
        price: menuItem?.price || 0,
        quantity: item._sum.quantity || 0,
        orders: item._count,
        revenue: ((item._sum.quantity || 0) * (menuItem?.price || 0)),
        rating: 0 // Would need feedback table
      };
    });

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Top items retrieved successfully',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Top items error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to retrieve top items',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /api/v1/analytics/revenue
 * Get revenue analytics and breakdown
 */
export const getRevenueAnalytics = async (req: authenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Revenue by payment method
    const revenueByMethod = await prisma.payment.groupBy({
      by: ['method'],
      where: {
        createdAt: { gte: start, lte: end },
        status: 'COMPLETED'
      },
      _sum: { amount: true },
      _count: true
    });

    // Total revenue
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    });

    // Revenue growth
    const thirtyDaysAgo = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousRevenue = await prisma.payment.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo, lt: start },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    });

    const currentTotal = totalRevenue._sum.amount || 0;
    const previousTotal = previousRevenue._sum.amount || 0;
    const growth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Revenue analytics retrieved successfully',
      data: {
        dateRange: { start, end },
        totalRevenue: currentTotal,
        totalTransactions: await prisma.payment.count({
          where: {
            createdAt: { gte: start, lte: end },
            status: 'COMPLETED'
          }
        }),
        byPaymentMethod: revenueByMethod.map((r) => ({
          method: r.method,
          amount: r._sum.amount || 0,
          count: r._count
        })),
        growth: {
          percentage: Math.round(growth * 100) / 100,
          comparison: {
            current: currentTotal,
            previous: previousTotal
          }
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to retrieve revenue analytics',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /api/v1/analytics/customer-insights
 * Get customer behavior and insights
 */
export const getCustomerInsights = async (req: authenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Total unique customers
    const uniqueCustomers = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      select: { userId: true },
      distinct: ['userId']
    });

    // Repeat customers
    const customerOrders = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _count: { id: true }
    });

    const repeatCustomers = customerOrders.filter((c) => c._count.id > 1).length;

    // Customer spending distribution
    const customerSpending = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _sum: { totalPrice: true }
    });

    const avgSpending = customerSpending.length > 0 
      ? (customerSpending.reduce((sum, c) => sum + (c._sum.totalPrice || 0), 0)) / customerSpending.length
      : 0;

    // Most valuable customers
    const topCustomers = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _sum: { totalPrice: true },
      _count: { id: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 10
    });

    const users = await prisma.user.findMany({
      where: {
        id: { in: topCustomers.map((c) => c.userId) }
      },
      select: { id: true, name: true, email: true }
    });

    const topCustomersData = topCustomers.map((tc) => {
      const user = users.find((u) => u.id === tc.userId);
      return {
        userId: tc.userId,
        name: user?.name || 'Unknown',
        email: user?.email || 'Unknown',
        orders: tc._count.id,
        spent: tc._sum.totalPrice || 0,
        avgOrderValue: tc._count.id > 0 ? (tc._sum.totalPrice || 0) / tc._count.id : 0
      };
    });

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Customer insights retrieved successfully',
      data: {
        dateRange: { start, end },
        totalCustomers: uniqueCustomers.length,
        repeatCustomers,
        repeatRate: uniqueCustomers.length > 0 
          ? Math.round((repeatCustomers / uniqueCustomers.length) * 100) 
          : 0,
        avgCustomerValue: avgSpending,
        topCustomers: topCustomersData
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Customer insights error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to retrieve customer insights',
      timestamp: new Date().toISOString()
    });
  }
};
