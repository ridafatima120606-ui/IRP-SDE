import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  getAvailableTables,
  updateTableStatus,
  getTablesByAmbiance,
  getFloorPlan,
  getTableClearanceForecast
} from '../controllers/tableController';
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
        field: err.param || err.location || 'unknown',
        message: err.msg
      })),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Public routes
router.get('/', getAllTables);

router.get('/available', getAvailableTables);

router.get('/ambiance/:ambiance', getTablesByAmbiance);

router.get('/floor-plan', getFloorPlan);

router.get('/clearance-forecast', getTableClearanceForecast);

router.get('/:id', getTableById);

// Protected routes (Admin only)
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  [
    body('tableNumber').isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('location').notEmpty().withMessage('Location is required'),
    body('tableType').optional().isString().withMessage('Table type must be a string'),
    body('ambiance').optional().isString().withMessage('Ambiance must be a string')
  ],
  handleValidationErrors,
  createTable
);

router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  [
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('tableType').optional().isString().withMessage('Table type must be a string'),
    body('ambiance').optional().isString().withMessage('Ambiance must be a string')
  ],
  handleValidationErrors,
  updateTable
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  deleteTable
);

// Update table status (Admin/Staff)
router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMIN']),
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'])
      .withMessage('Invalid status value')
  ],
  handleValidationErrors,
  updateTableStatus
);

export default router;


