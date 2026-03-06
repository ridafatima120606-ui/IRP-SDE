import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  addItemsToOrder,
  cancelOrder,
  getKitchenPendingOrders,
  getOrderBillBreakdown
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Middleware to handle validation errors
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: errors.array().map((err: any) => ({
        field: err.path || err.param,
        message: err.msg
      })),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Protected routes (Authenticated users)
router.post(
  '/',
  authenticate,
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Items must be an array with at least one item'),
    body('items.*.menuItemId')
      .notEmpty()
      .withMessage('Menu item ID is required'),
    body('items.*.quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('tableId')
      .optional()
      .isString()
      .withMessage('Table ID must be a string'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string'),
    body('isDelivery')
      .optional()
      .isBoolean()
      .withMessage('isDelivery must be a boolean')
  ],
  handleValidationErrors,
  createOrder
);

router.get(
  '/',
  authenticate,
  getUserOrders
);

router.post(
  '/:id/items',
  authenticate,
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Items must be an array with at least one item'),
    body('items.*.menuItemId')
      .notEmpty()
      .withMessage('Menu item ID is required'),
    body('items.*.quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer')
  ],
  handleValidationErrors,
  addItemsToOrder
);

router.put(
  '/:id/cancel',
  authenticate,
  [
    body('reason')
      .optional()
      .isString()
      .withMessage('Reason must be a string')
  ],
  handleValidationErrors,
  cancelOrder
);

// Admin/Kitchen routes
router.get(
  '/all/list',
  authenticate,
  authorize(['ADMIN', 'CHEF']),
  getAllOrders
);

router.get(
  '/kitchen/pending',
  authenticate,
  authorize(['ADMIN', 'CHEF']),
  getKitchenPendingOrders
);

router.get(
  '/:id/bill',
  authenticate,
  getOrderBillBreakdown
);

// Public routes
router.get('/:id', getOrderById);

router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMIN', 'CHEF']),
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'])
      .withMessage('Invalid status value')
  ],
  handleValidationErrors,
  updateOrderStatus
);

export default router;
