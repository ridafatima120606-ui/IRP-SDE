import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getCurrentUser,
  logout,
  updateProfile,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('phone').optional().isMobilePhone('any'),
  ],
  handleValidationErrors,
  register
);

/**
 * POST /api/v1/auth/login
 * Login user and get JWT token
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  handleValidationErrors,
  login
);

/**
 * GET /api/v1/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post('/logout', authenticate, logout);

/**
 * PUT /api/v1/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().isMobilePhone('any'),
  ],
  handleValidationErrors,
  updateProfile
);

export default router;
