import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendCustomNotification,
  getNotificationStats,
  sendTestNotification,
  broadcastNotification,
} from "../controllers/notificationController";

const router = Router();

/**
 * Customer Routes
 */

// Get user notifications
router.get("/", authenticate, getNotifications);

// Mark notification as read
router.post("/:id/read", authenticate, markAsRead);

// Delete notification
router.delete("/:id", authenticate, deleteNotification);

// Get notification preferences
router.get("/preferences", authenticate, getNotificationPreferences);

// Update preferences
router.put("/preferences", authenticate, updateNotificationPreferences);

// Send test notification
router.post("/test", authenticate, sendTestNotification);

/**
 * Admin Routes
 */

// Send custom notification
router.post("/send", authenticate, authorize("ADMIN"), sendCustomNotification);

// Get statistics
router.get("/admin/stats", authenticate, authorize("ADMIN"), getNotificationStats);

// Broadcast notification
router.post("/broadcast", authenticate, authorize("ADMIN"), broadcastNotification);

export default router;
