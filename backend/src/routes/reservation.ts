import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createReservation,
  getUserReservations,
  getReservationById,
  cancelReservation,
  checkInReservation,
  getAvailableSlots,
  modifyReservation
} from '../controllers/reservationController';
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

// Public routes
router.get('/slots/available', getAvailableSlots);

router.get('/:id', getReservationById);

// Protected routes (Authenticated users)
router.post(
  '/',
  authenticate,
  [
    body('guestCount')
      .isInt({ min: 1, max: 20 })
      .withMessage('Guest count must be between 1 and 20'),
    body('reservationDate')
      .isISO8601()
      .withMessage('Reservation date must be a valid date'),
    body('tableId')
      .optional()
      .isString()
      .withMessage('Table ID must be a string'),
    body('durationMinutes')
      .optional()
      .isInt({ min: 30, max: 480 })
      .withMessage('Duration must be between 30 and 480 minutes'),
    body('specialRequests')
      .optional()
      .isString()
      .withMessage('Special requests must be a string')
  ],
  handleValidationErrors,
  createReservation
);

router.get(
  '/user/my-reservations',
  authenticate,
  getUserReservations
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
  cancelReservation
);

router.post(
  '/:id/check-in',
  authenticate,
  checkInReservation
);

// Admin-only routes
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  [
    body('guestCount')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Guest count must be between 1 and 20'),
    body('reservationDate')
      .optional()
      .isISO8601()
      .withMessage('Reservation date must be a valid date'),
    body('tableId')
      .optional()
      .isString()
      .withMessage('Table ID must be a string')
  ],
  handleValidationErrors,
  modifyReservation
);

export default router;
