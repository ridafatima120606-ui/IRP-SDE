import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getDynamicMenu,
  getItemPrice,
  getDemandForecast,
  createPricingRule,
  getPricingRules,
  updatePricingRule,
  deletePricingRule,
  getPricingAnalytics,
} from "../controllers/pricingController";

const router = Router();

/**
 * Customer Routes
 */

// Get menu with dynamic prices
router.get("/menu", getDynamicMenu);

// Get current price for an item
router.get("/item/:id", getItemPrice);

/**
 * Admin Routes
 */

// Get 7-day demand forecast
router.get("/forecast", authenticate, authorize("ADMIN"), getDemandForecast);

// Create pricing rule
router.post("/rules", authenticate, authorize("ADMIN"), createPricingRule);

// Get all rules
router.get("/rules", authenticate, authorize("ADMIN"), getPricingRules);

// Update rule
router.put("/rules/:id", authenticate, authorize("ADMIN"), updatePricingRule);

// Delete rule
router.delete("/rules/:id", authenticate, authorize("ADMIN"), deletePricingRule);

// Get pricing analytics
router.get("/analytics", authenticate, authorize("ADMIN"), getPricingAnalytics);

export default router;
