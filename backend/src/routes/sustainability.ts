import { Router } from 'express';
import { body } from 'express-validator';
import {
  getSustainabilityScore,
  getAllDishesWithScores,
  getRestaurantMetrics,
  filterBySustainabilityScore,
  addSustainabilityMetrics,
  updateSustainabilityMetrics,
} from '../controllers/sustainabilityController';
import { authenticate, authorize } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/v1/sustainability/score/:menuItemId
 * Get sustainability score for a menu item
 */
router.get('/score/:menuItemId', getSustainabilityScore);

/**
 * GET /api/v1/sustainability/dishes
 * Get all dishes with sustainability scores
 */
router.get('/dishes', getAllDishesWithScores);

/**
 * GET /api/v1/sustainability/summary
 * Get restaurant sustainability metrics summary
 */
router.get('/summary', getRestaurantMetrics);

/**
 * GET /api/v1/sustainability/filter
 * Filter dishes by sustainability score minimum
 */
router.get('/filter', filterBySustainabilityScore);

/**
 * POST /api/v1/sustainability/metrics
 * Add sustainability metrics for a menu item (Admin only)
 */
router.post(
  '/metrics',
  authenticate,
  authorize('ADMIN'),
  [
    body('menuItemId').isString().notEmpty(),
    body('carbonFootprint').isFloat({ min: 0 }),
    body('waterUsage').optional().isFloat({ min: 0 }),
    body('transportDistance').optional().isInt({ min: 0 }),
    body('isLocalIngredient').optional().isBoolean(),
    body('isOrganic').optional().isBoolean(),
    body('isVegan').optional().isBoolean(),
    body('isVegetarian').optional().isBoolean(),
    body('isSeasonal').optional().isBoolean(),
    body('packagingType').optional().isString(),
  ],
  handleValidationErrors,
  addSustainabilityMetrics
);

/**
 * PUT /api/v1/sustainability/metrics/:id
 * Update sustainability metrics (Admin only)
 */
router.put(
  '/metrics/:id',
  authenticate,
  authorize('ADMIN'),
  [
    body('carbonFootprint').optional().isFloat({ min: 0 }),
    body('waterUsage').optional().isFloat({ min: 0 }),
    body('transportDistance').optional().isInt({ min: 0 }),
    body('isLocalIngredient').optional().isBoolean(),
    body('isOrganic').optional().isBoolean(),
    body('isVegan').optional().isBoolean(),
    body('isVegetarian').optional().isBoolean(),
    body('isSeasonal').optional().isBoolean(),
    body('packagingType').optional().isString(),
  ],
  handleValidationErrors,
  updateSustainabilityMetrics
);

export default router;
