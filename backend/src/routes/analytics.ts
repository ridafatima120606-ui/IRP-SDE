import { Router } from 'express';
import { query } from 'express-validator';
import {
  getDashboardOverview,
  getSalesByDate,
  getSalesByCategory,
  getPeakHours,
  getTopItems,
  getRevenueAnalytics,
  getCustomerInsights
} from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = Router();

/**
 * All analytics endpoints require authentication and ADMIN role
 */
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * GET /api/v1/analytics/dashboard/overview
 * Get dashboard overview with key metrics
 */
router.get(
  '/dashboard/overview',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  handleValidationErrors,
  getDashboardOverview
);

/**
 * GET /api/v1/analytics/sales/by-date
 * Get sales analytics by date
 * Query params: startDate, endDate, groupBy (day|week|month)
 */
router.get(
  '/sales/by-date',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('groupBy').optional().isIn(['day', 'week', 'month'])
  ],
  handleValidationErrors,
  getSalesByDate
);

/**
 * GET /api/v1/analytics/sales/by-category
 * Get sales analytics by menu category
 */
router.get(
  '/sales/by-category',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  handleValidationErrors,
  getSalesByCategory
);

/**
 * GET /api/v1/analytics/peak-hours
 * Get peak hours analysis with hourly breakdown
 */
router.get(
  '/peak-hours',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  handleValidationErrors,
  getPeakHours
);

/**
 * GET /api/v1/analytics/top-items
 * Get top selling menu items
 * Query params: startDate, endDate, limit (default 10)
 */
router.get(
  '/top-items',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  getTopItems
);

/**
 * GET /api/v1/analytics/revenue
 * Get revenue analytics and breakdown by payment method
 */
router.get(
  '/revenue',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  handleValidationErrors,
  getRevenueAnalytics
);

/**
 * GET /api/v1/analytics/customer-insights
 * Get customer behavior and insights
 */
router.get(
  '/customer-insights',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  handleValidationErrors,
  getCustomerInsights
);

export default router;
