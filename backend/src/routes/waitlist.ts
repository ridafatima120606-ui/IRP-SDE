import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  joinWaitlist,
  getWaitlistStatus,
  cancelWaitlist,
  getWaitlistList,
  seatCustomer,
  getWaitlistStats,
  removeExpiredEntry,
  cleanupExpiredEntries,
} from "../controllers/waitlistController";

const router = Router();

/**
 * Customer Routes
 */

// Join waitlist
router.post("/join", authenticate, joinWaitlist);

// Get my waitlist status
router.get("/status/:id", authenticate, getWaitlistStatus);

// Cancel my waitlist entry
router.put("/:id/cancel", authenticate, cancelWaitlist);

/**
 * Admin Routes
 */

// Get all waitlist entries
router.get("/admin/list", authenticate, authorize(["ADMIN", "CHEF"]), getWaitlistList);

// Get waitlist statistics
router.get("/admin/stats", authenticate, authorize(["ADMIN", "CHEF"]), getWaitlistStats);

// Seat a customer
router.put("/:id/seat", authenticate, authorize(["ADMIN", "CHEF"]), seatCustomer);

// Remove entry
router.delete("/:id/remove", authenticate, authorize(["ADMIN", "CHEF"]), removeExpiredEntry);

// Cleanup expired entries
router.post("/admin/cleanup", authenticate, authorize(["ADMIN", "CHEF"]), cleanupExpiredEntries);

export default router;
