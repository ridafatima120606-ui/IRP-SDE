import { Router, Request } from 'express';
import { body, param } from 'express-validator';
import {
  processCheckoutPayment,
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  getPaymentHistory,
  getPaymentDetails,
  generateInvoice,
  handlePaymentWebhook
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/v1/payments
 * Simple checkout payment endpoint
 */
router.post(
  '/',
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').optional().isLength({ min: 2, max: 3 }),
    body('method').optional().isString()
  ],
  handleValidationErrors,
  processCheckoutPayment
);

/**
 * POST /api/v1/payments/intent
 * Create a payment intent for checkout
 */
router.post(
  '/intent',
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').optional().isLength({ min: 2, max: 3 }),
    body('paymentMethod').optional().isIn(['card', 'cash', 'wallet', 'cryptocurrency'])
  ],
  handleValidationErrors,
  authenticate,
  createPaymentIntent
);

/**
 * POST /api/v1/payments/confirm
 * Confirm a payment after successful Stripe transaction
 */
router.post(
  '/confirm',
  [
    body('paymentIntentId').optional().notEmpty(),
    body('orderId').optional().notEmpty()
  ],
  handleValidationErrors,
  authenticate,
  confirmPayment
);

/**
 * GET /api/v1/payments/history
 * Get payment history for authenticated user
 */
router.get(
  '/history',
  authenticate,
  getPaymentHistory
);

/**
 * GET /api/v1/payments/:paymentId
 * Get details of a specific payment
 */
router.get(
  '/:paymentId',
  [
    param('paymentId').notEmpty().withMessage('Payment ID is required')
  ],
  handleValidationErrors,
  authenticate,
  getPaymentDetails
);

/**
 * POST /api/v1/payments/:paymentId/refund
 * Refund a completed payment
 */
router.post(
  '/:paymentId/refund',
  [
    param('paymentId').notEmpty().withMessage('Payment ID is required'),
    body('reason').optional().isString()
  ],
  handleValidationErrors,
  authenticate,
  refundPayment
);

/**
 * GET /api/v1/payments/:paymentId/invoice
 * Generate invoice for a payment
 */
router.get(
  '/:paymentId/invoice',
  [
    param('paymentId').notEmpty().withMessage('Payment ID is required')
  ],
  handleValidationErrors,
  authenticate,
  generateInvoice
);

/**
 * POST /api/v1/payments/webhook/stripe
 * Stripe webhook handler (no authentication required for webhooks)
 */
router.post(
  '/webhook/stripe',
  // Webhook should be raw body, not JSON parsed
  (req: Request, res, next) => {
    if (req.path === '/webhook/stripe') {
      return handlePaymentWebhook(req, res);
    }
    next();
  }
);

export default router;
