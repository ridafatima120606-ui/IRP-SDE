import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuByCategory,
  getCategories,
  toggleAvailability
} from '../controllers/menuController';
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
router.get('/', getAllMenuItems);

router.get('/categories', getCategories);

router.get('/category/:category', getMenuByCategory);

router.get('/:id', getMenuItemById);

// Protected routes (Admin only)
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('moodTags').optional().isArray().withMessage('Mood tags must be an array'),
    body('suitableFor').optional().isArray().withMessage('Suitable for must be an array'),
    body('customizations').optional().isArray().withMessage('Customizations must be an array'),
    body('ingredients').optional().isArray().withMessage('Ingredients must be an array'),
    body('prepTime').optional().isInt({ min: 1 }).withMessage('Prep time must be a positive number'),
    body('available').optional().isBoolean().withMessage('Available must be a boolean')
  ],
  handleValidationErrors,
  createMenuItem
);

router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('moodTags').optional().isArray().withMessage('Mood tags must be an array'),
    body('suitableFor').optional().isArray().withMessage('Suitable for must be an array'),
    body('customizations').optional().isArray().withMessage('Customizations must be an array'),
    body('ingredients').optional().isArray().withMessage('Ingredients must be an array'),
    body('prepTime').optional().isInt({ min: 1 }).withMessage('Prep time must be a positive number'),
    body('available').optional().isBoolean().withMessage('Available must be a boolean')
  ],
  handleValidationErrors,
  updateMenuItem
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  deleteMenuItem
);

// Toggle availability (Admin only)
router.patch(
  '/:id/availability',
  authenticate,
  authorize(['ADMIN']),
  [
    body('available').isBoolean().withMessage('Available must be a boolean')
  ],
  handleValidationErrors,
  toggleAvailability
);

export default router;
