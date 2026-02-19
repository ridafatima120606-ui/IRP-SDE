import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllMoodsController,
  getMoodRecommendations,
  setMoodPreference,
  getMenuForMood,
  getTablesForMood,
  getUserMoodPreference,
} from '../controllers/moodController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/v1/moods
 * Get all available mood categories
 */
router.get('/', getAllMoodsController);

/**
 * GET /api/v1/moods/:id/recommendations
 * Get recommendations for a specific mood
 */
router.get('/:id/recommendations', getMoodRecommendations);

/**
 * POST /api/v1/moods/:id/preferences
 * Set user mood preference (requires authentication)
 */
router.post(
  '/:id/preferences',
  authenticate,
  [
    body('preferredTableType').optional().isString(),
    body('lightingPreference').optional().isString(),
    body('musicPreference').optional().isString(),
  ],
  handleValidationErrors,
  setMoodPreference
);

/**
 * GET /api/v1/moods/:id/menu
 * Get menu items recommended for a mood
 */
router.get('/:id/menu', getMenuForMood);

/**
 * GET /api/v1/moods/:id/tables
 * Get tables suitable for a mood
 */
router.get('/:id/tables', getTablesForMood);

/**
 * GET /api/v1/moods/my-preference
 * Get current user's mood preference (requires authentication)
 */
router.get('/my-preference', authenticate, getUserMoodPreference);

export default router;
