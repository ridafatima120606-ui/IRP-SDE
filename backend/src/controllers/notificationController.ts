import { Request, Response } from "express";
import { PrismaClient, NotificationType, NotificationStatus } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Notification Controller
 * Manages user notifications across email, SMS, and in-app channels
 */

// Notification templates (in production, these would be external templates)
const NOTIFICATION_TEMPLATES = {
  ORDER_CONFIRMED: {
    email: "Your order has been confirmed!",
    sms: "Order confirmed. Estimated prep time: 30 minutes",
  },
  ORDER_READY: {
    email: "Your order is ready to pick up!",
    sms: "Your order is ready!",
  },
  RESERVATION_CONFIRMED: {
    email: "Your reservation has been confirmed!",
    sms: "Table reserved. See you soon!",
  },
  WAITLIST_SEATED: {
    email: "Your table is ready!",
    sms: "Your table is ready. Please come to the host stand.",
  },
  LOYALTY_MILESTONE: {
    email: "Congratulations! You've reached a new loyalty tier!",
    sms: "You're now a {tier} member!",
  },
};

/**
 * Get user notifications
 * GET /api/v1/notifications
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { limit = "50", offset = "0", unreadOnly = "false" } = req.query;

    const whereClause: any = { userId };
    if (unreadOnly === "true") {
      whereClause.readAt = null;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: parseInt(offset as string),
      take: parseInt(limit as string),
    });

    const total = await prisma.notification.count({ where: whereClause });
    const unreadCount = await prisma.notification.count({
      where: { userId, readAt: null },
    });

    res.json({
      notifications,
      total,
      unreadCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

/**
 * Mark notification as read
 * POST /api/v1/notifications/:id/read
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    if (notification.userId !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    res.json({
      message: "Marked as read",
      notification: updated,
    });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ error: "Failed to update" });
  }
};

/**
 * Delete notification
 * DELETE /api/v1/notifications/:id
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    if (notification.userId !== userId && (req as any).role !== "ADMIN") {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete" });
  }
};

/**
 * Get notification preferences
 * GET /api/v1/notifications/preferences
 */
export const getNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create if doesn't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          emailNotifs: true,
          smsNotifs: false,
          pushNotifs: true,
          promotions: true,
          orderUpdates: true,
          reservationReminders: true,
        },
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
};

/**
 * Update notification preferences
 * PUT /api/v1/notifications/preferences
 */
export const updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const {
      emailNotifs,
      smsNotifs,
      pushNotifs,
      promotions,
      orderUpdates,
      reservationReminders,
    } = req.body;

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          emailNotifs: emailNotifs ?? true,
          smsNotifs: smsNotifs ?? false,
          pushNotifs: pushNotifs ?? true,
          promotions: promotions ?? true,
          orderUpdates: orderUpdates ?? true,
          reservationReminders: reservationReminders ?? true,
        },
      });
    } else {
      preferences = await prisma.notificationPreference.update({
        where: { userId },
        data: {
          ...(emailNotifs !== undefined && { emailNotifs }),
          ...(smsNotifs !== undefined && { smsNotifs }),
          ...(pushNotifs !== undefined && { pushNotifs }),
          ...(promotions !== undefined && { promotions }),
          ...(orderUpdates !== undefined && { orderUpdates }),
          ...(reservationReminders !== undefined && { reservationReminders }),
        },
      });
    }

    res.json({
      message: "Preferences updated",
      preferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
};

/**
 * Send custom notification (Admin only)
 * POST /api/v1/notifications/send
 */
export const sendCustomNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type, title, message, data } = req.body;

    if (!userId || !type || !title || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type as NotificationType,
        title,
        message,
        data: data || null,
        status: "PENDING",
      },
    });

    // In a real system, this would trigger actual email/SMS sending
    // For now, we'll mark it as sent
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    res.json({
      message: "Notification sent",
      notification,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};

/**
 * Get notification statistics (Admin only)
 * GET /api/v1/notifications/stats
 */
export const getNotificationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalSent = await prisma.notification.count({
      where: {
        status: "SENT",
        sentAt: { gte: today },
      },
    });

    const totalFailed = await prisma.notification.count({
      where: {
        status: "FAILED",
        sentAt: { gte: today },
      },
    });

    const byType = await prisma.notification.groupBy({
      by: ["type"],
      where: { sentAt: { gte: today } },
      _count: true,
    });

    const unreadCount = await prisma.notification.count({
      where: { readAt: null },
    });

    res.json({
      today: today.toISOString().split("T")[0],
      totalSent,
      totalFailed,
      deliveryRate: totalSent > 0 ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(2) : 0,
      byType,
      currentlyUnread: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

/**
 * Send test notification (Admin only)
 * POST /api/v1/notifications/test
 */
export const sendTestNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: "PROMOTION",
        title: "Test Notification",
        message: "This is a test notification to verify your notification settings are working correctly.",
        status: "SENT",
        sentAt: new Date(),
      },
    });

    res.json({
      message: "Test notification sent",
      notification,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ error: "Failed to send test" });
  }
};

/**
 * Create notification (Internal - for use by other services)
 * Not exposed as API endpoint, called from other controllers
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: any
): Promise<string> => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || null,
        status: "PENDING",
      },
    });

    return notification.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Broadcast notification to all users (Admin only)
 * POST /api/v1/notifications/broadcast
 */
export const broadcastNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, title, message, userFilter } = req.body;

    let whereClause: any = {};
    
    // Apply user filters if provided
    if (userFilter?.tier) {
      whereClause = {
        loyaltyPoints: {
          tier: userFilter.tier,
        },
      };
    }

    // Get matching users
    const users = await prisma.user.findMany({
      where: whereClause,
      select: { id: true },
    });

    // Create notifications for each user
    const results = await Promise.all(
      users.map((user) =>
        prisma.notification.create({
          data: {
            userId: user.id,
            type: type as NotificationType,
            title,
            message,
            status: "SENT",
            sentAt: new Date(),
          },
        })
      )
    );

    res.json({
      message: `Broadcast sent to ${results.length} users`,
      sentCount: results.length,
    });
  } catch (error) {
    console.error("Error broadcasting:", error);
    res.status(500).json({ error: "Failed to broadcast" });
  }
};
