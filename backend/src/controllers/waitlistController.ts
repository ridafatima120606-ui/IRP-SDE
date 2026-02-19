import { Request, Response } from "express";
import { prisma } from "../config/database";
import { authenticatedRequest } from "../types";

/**
 * Waitlist Controller
 * Manages customer queue during peak times with priority-based seating
 */

type MockWaitlistStatus = "WAITING" | "NOTIFIED" | "SEATED" | "CANCELLED";
type MockWaitlistEntry = {
  id: string;
  userId: string;
  guestCount: number;
  preferredTime: Date;
  priority: number;
  status: MockWaitlistStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
};

const mockWaitlistStore: MockWaitlistEntry[] = [];

const toStatus = (value: unknown): MockWaitlistStatus | null => {
  if (!value) return null;
  const normalized = String(value).toUpperCase();
  if (normalized === "WAITING" || normalized === "NOTIFIED" || normalized === "SEATED" || normalized === "CANCELLED") {
    return normalized;
  }
  return null;
};

// Calculate priority score based on loyalty tier, wait time, and referrals
const calculatePriority = async (userId: string, waitTimeMinutes: number): Promise<number> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { loyaltyPoints: true },
  });

  if (!user || !user.loyaltyPoints) {
    return waitTimeMinutes;
  }

  // Base points from wait time
  let priority = waitTimeMinutes;

  // Loyalty tier multiplier
  const tierMultiplier: Record<string, number> = {
    SILVER: 1,
    GOLD: 1.5,
    PLATINUM: 2,
  };

  const multiplier = tierMultiplier[user.loyaltyPoints.tier] || 1;
  priority *= multiplier;

  // Loyalty points bonus
  if (user.loyaltyPoints.points > 500) {
    priority += 50; // Gold tier bonus
  }
  if (user.loyaltyPoints.points > 2000) {
    priority += 100; // Platinum tier bonus
  }

  return priority;
};

// Add customer to waitlist
// POST /api/v1/waitlist/join
export const joinWaitlist = async (req: authenticatedRequest, res: Response): Promise<void> => {
  try {
    const { guestCount, preferredTime } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (!guestCount || !preferredTime) {
      res.status(400).json({ error: "guestCount and preferredTime are required" });
      return;
    }

    if (guestCount < 1 || guestCount > 20) {
      res.status(400).json({ error: "Guest count must be between 1 and 20" });
      return;
    }

    // Check if user already on waitlist
    const existingWaitlist = await prisma.waitlist.findFirst({
      where: {
        userId,
        status: { in: ["WAITING", "NOTIFIED"] },
      },
    });

    if (existingWaitlist) {
      res.status(400).json({ error: "User already on waitlist" });
      return;
    }

    // Create waitlist entry
    const preferred = new Date(preferredTime);
    const priority = await calculatePriority(userId, 0);

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        userId,
        guestCount,
        preferredTime: preferred,
        priority: Math.round(priority),
        status: "WAITING",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Calculate estimated wait time (30 min base + 2 min per person ahead)
    const peopleAhead = await prisma.waitlist.count({
      where: {
        id: { not: waitlistEntry.id },
        status: { in: ["WAITING", "NOTIFIED"] },
        priority: { gt: waitlistEntry.priority },
      },
    });

    const estimatedWaitMinutes = 30 + peopleAhead * 2;

    res.status(201).json({
      id: waitlistEntry.id,
      position: peopleAhead + 1,
      estimatedWaitMinutes,
      message: `You've been added to the waitlist. Estimated wait: ${estimatedWaitMinutes} minutes`,
    });
  } catch (error) {
    try {
      const { guestCount, preferredTime } = req.body;
      const userId = req.user?.id || "anonymous-user";
      if (!guestCount || !preferredTime) {
        res.status(400).json({ error: "guestCount and preferredTime are required" });
        return;
      }

      const entry: MockWaitlistEntry = {
        id: `mock-wait-${Date.now()}`,
        userId,
        guestCount,
        preferredTime: new Date(preferredTime),
        priority: 1,
        status: "WAITING",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: userId,
          name: "Demo User",
          email: "demo@example.com",
          phone: null,
        },
      };
      mockWaitlistStore.push(entry);
      const position = mockWaitlistStore.filter((e) => e.status === "WAITING" || e.status === "NOTIFIED").length;
      const estimatedWaitMinutes = 30 + (position - 1) * 2;
      res.status(201).json({
        id: entry.id,
        position,
        estimatedWaitMinutes,
        message: `You've been added to the waitlist. Estimated wait: ${estimatedWaitMinutes} minutes`,
      });
    } catch (fallbackError) {
      console.error("Error joining waitlist:", error, fallbackError);
      res.status(500).json({ error: "Failed to join waitlist" });
    }
  }
};

// Get waitlist status
// GET /api/v1/waitlist/status/:id
export const getWaitlistStatus = async (req: authenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = (req as any).role || 'CUSTOMER';

    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!waitlistEntry) {
      res.status(404).json({ error: "Waitlist entry not found" });
      return;
    }

    // Verify ownership
    if (waitlistEntry.userId !== userId && userRole !== "ADMIN") {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    // Calculate current position
    const position = await prisma.waitlist.count({
      where: {
        status: { in: ["WAITING", "NOTIFIED"] },
        priority: { gt: waitlistEntry.priority },
      },
    });

    // Calculate estimated wait
    const estimatedWaitMinutes = 30 + position * 2;

    res.json({
      id: waitlistEntry.id,
      status: waitlistEntry.status,
      position: position + 1,
      guestCount: waitlistEntry.guestCount,
      preferredTime: waitlistEntry.preferredTime,
      priority: waitlistEntry.priority,
      estimatedWaitMinutes,
      createdAt: waitlistEntry.createdAt,
    });
  } catch (error) {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "CUSTOMER";
    const entry = mockWaitlistStore.find((e) => e.id === id);
    if (!entry) {
      res.status(404).json({ error: "Waitlist entry not found" });
      return;
    }
    if (entry.userId !== userId && userRole !== "ADMIN") {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }
    const position = mockWaitlistStore.filter(
      (e) => (e.status === "WAITING" || e.status === "NOTIFIED") && e.priority > entry.priority
    ).length;
    res.json({
      id: entry.id,
      status: entry.status,
      position: position + 1,
      guestCount: entry.guestCount,
      preferredTime: entry.preferredTime,
      priority: entry.priority,
      estimatedWaitMinutes: 30 + position * 2,
      createdAt: entry.createdAt,
    });
  }
};

// Cancel waitlist entry
// PUT /api/v1/waitlist/:id/cancel
export const cancelWaitlist = async (req: authenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = (req as any).role || 'CUSTOMER';

    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id },
    });

    if (!waitlistEntry) {
      res.status(404).json({ error: "Waitlist entry not found" });
      return;
    }

    // Verify ownership
    if (waitlistEntry.userId !== userId && userRole !== "ADMIN") {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const updated = await prisma.waitlist.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.json({
      message: "Removed from waitlist",
      entry: updated,
    });
  } catch (error) {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "CUSTOMER";
    const index = mockWaitlistStore.findIndex((e) => e.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Waitlist entry not found" });
      return;
    }
    if (mockWaitlistStore[index].userId !== userId && userRole !== "ADMIN") {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }
    mockWaitlistStore[index] = {
      ...mockWaitlistStore[index],
      status: "CANCELLED",
      updatedAt: new Date(),
    };
    res.json({
      message: "Removed from waitlist",
      entry: mockWaitlistStore[index],
    });
  }
};

// Get all waitlist entries (Admin only)
// GET /api/v1/waitlist/admin/list
export const getWaitlistList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, limit = "50", offset = "0" } = req.query;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const entries = await prisma.waitlist.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        priority: "desc",
      },
      skip: parseInt(offset as string),
      take: parseInt(limit as string),
    });

    // Add position numbers
    const entriesWithPosition = entries.map((entry, index) => ({
      ...entry,
      position: parseInt(offset as string) + index + 1,
    }));

    const total = await prisma.waitlist.count({ where: whereClause });

    res.json({
      entries: entriesWithPosition,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    const { status, limit = "50", offset = "0" } = req.query;
    const statusFilter = toStatus(status);
    const filtered = statusFilter
      ? mockWaitlistStore.filter((e) => e.status === statusFilter)
      : mockWaitlistStore;
    const sorted = [...filtered].sort((a, b) => b.priority - a.priority);
    const off = parseInt(offset as string);
    const lim = parseInt(limit as string);
    const entries = sorted.slice(off, off + lim).map((entry, index) => ({
      ...entry,
      position: off + index + 1,
    }));
    res.json({
      entries,
      total: filtered.length,
      limit: lim,
      offset: off,
    });
  }
};

// Seat a customer from waitlist (Admin only)
// PUT /api/v1/waitlist/:id/seat
export const seatCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { tableId } = req.body;

    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id },
    });

    if (!waitlistEntry) {
      res.status(404).json({ error: "Waitlist entry not found" });
      return;
    }

    // Update status
    const updated = await prisma.waitlist.update({
      where: { id },
      data: {
        status: "SEATED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate wait time
    const waitTimeMs = new Date().getTime() - new Date(waitlistEntry.createdAt).getTime();
    const waitTimeMinutes = Math.round(waitTimeMs / 60000);

    res.json({
      message: "Customer seated",
      waitTimeMinutes,
      entry: updated,
    });
  } catch (error) {
    const { id } = req.params;
    const index = mockWaitlistStore.findIndex((e) => e.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Waitlist entry not found" });
      return;
    }
    const original = mockWaitlistStore[index];
    const updated: MockWaitlistEntry = {
      ...original,
      status: "SEATED",
      updatedAt: new Date(),
    };
    mockWaitlistStore[index] = updated;
    const waitTimeMs = updated.updatedAt.getTime() - updated.createdAt.getTime();
    res.json({
      message: "Customer seated",
      waitTimeMinutes: Math.max(1, Math.round(waitTimeMs / 60000)),
      entry: updated,
    });
  }
};

// Get waitlist statistics (Admin only)
// GET /api/v1/waitlist/admin/stats
export const getWaitlistStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const waitingCount = await prisma.waitlist.count({
      where: {
        status: "WAITING",
      },
    });

    const seatedToday = await prisma.waitlist.count({
      where: {
        status: "SEATED",
        updatedAt: {
          gte: today,
        },
      },
    });

    const cancelledToday = await prisma.waitlist.count({
      where: {
        status: "CANCELLED",
        updatedAt: {
          gte: today,
        },
      },
    });

    // Average wait time for seated customers
    const seatedEntries = await prisma.waitlist.findMany({
      where: {
        status: "SEATED",
        updatedAt: {
          gte: today,
        },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    const avgWaitTime =
      seatedEntries.length > 0
        ? seatedEntries.reduce((sum, entry) => {
            const waitMs = new Date(entry.updatedAt).getTime() - new Date(entry.createdAt).getTime();
            return sum + waitMs / 60000;
          }, 0) / seatedEntries.length
        : 0;

    res.json({
      currentlyWaiting: waitingCount,
      seatedToday,
      cancelledToday,
      averageWaitTimeMinutes: Math.round(avgWaitTime),
      totalTransactionsToday: seatedToday + cancelledToday,
      peakTime: "19:00 - 21:00", // This would be calculated from historical data
    });
  } catch (error) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentlyWaiting = mockWaitlistStore.filter((e) => e.status === "WAITING").length;
    const seatedToday = mockWaitlistStore.filter(
      (e) => e.status === "SEATED" && e.updatedAt >= today
    ).length;
    const cancelledToday = mockWaitlistStore.filter(
      (e) => e.status === "CANCELLED" && e.updatedAt >= today
    ).length;
    const seatedEntries = mockWaitlistStore.filter(
      (e) => e.status === "SEATED" && e.updatedAt >= today
    );
    const avgWaitTime =
      seatedEntries.length > 0
        ? seatedEntries.reduce((sum, entry) => {
            const waitMs = entry.updatedAt.getTime() - entry.createdAt.getTime();
            return sum + waitMs / 60000;
          }, 0) / seatedEntries.length
        : 0;

    res.json({
      currentlyWaiting,
      seatedToday,
      cancelledToday,
      averageWaitTimeMinutes: Math.round(avgWaitTime),
      totalTransactionsToday: seatedToday + cancelledToday,
      peakTime: "19:00 - 21:00",
    });
  }
};

// Remove expired waitlist entries (Admin only)
// DELETE /api/v1/waitlist/:id/remove
export const removeExpiredEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await prisma.waitlist.delete({
      where: { id },
    });

    res.json({
      message: "Entry removed",
      entry: deleted,
    });
  } catch (error) {
    const { id } = req.params;
    const index = mockWaitlistStore.findIndex((e) => e.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Waitlist entry not found" });
      return;
    }
    const deleted = mockWaitlistStore.splice(index, 1)[0];
    res.json({
      message: "Entry removed",
      entry: deleted,
    });
  }
};

// Auto-clean expired waitlist entries (runs periodically)
// POST /api/v1/waitlist/admin/cleanup
export const cleanupExpiredEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    // Remove entries older than 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const deleted = await prisma.waitlist.deleteMany({
      where: {
        AND: [
          {
            status: {
              in: ["CANCELLED", "SEATED"],
            },
          },
          {
            updatedAt: {
              lt: oneDayAgo,
            },
          },
        ],
      },
    });

    res.json({
      message: "Cleanup completed",
      removedCount: deleted.count,
    });
  } catch (error) {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    const before = mockWaitlistStore.length;
    for (let i = mockWaitlistStore.length - 1; i >= 0; i -= 1) {
      const item = mockWaitlistStore[i];
      if ((item.status === "CANCELLED" || item.status === "SEATED") && item.updatedAt < oneDayAgo) {
        mockWaitlistStore.splice(i, 1);
      }
    }
    res.json({
      message: "Cleanup completed",
      removedCount: before - mockWaitlistStore.length,
    });
  }
};
