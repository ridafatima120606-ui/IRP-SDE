/**
 * Waitlist Types
 */
export interface WaitlistEntry {
  id: string;
  userId: string;
  guestCount: number;
  preferredTime: string;
  priority: number;
  status: 'WAITING' | 'NOTIFIED' | 'SEATED' | 'CANCELLED';
  position?: number;
  estimatedWaitMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WaitlistJoinRequest {
  guestCount: number;
  preferredTime: string;
}

export interface WaitlistResponse {
  id: string;
  position: number;
  estimatedWaitMinutes: number;
  message: string;
}

export interface WaitlistStats {
  currentlyWaiting: number;
  seatedToday: number;
  cancelledToday: number;
  averageWaitTimeMinutes: number;
  totalTransactionsToday: number;
  peakTime: string;
}

/**
 * Dynamic Pricing Types
 */
export interface DynamicPrice {
  id: string;
  menuItemId: string;
  timeRange: string;
  dayOfWeek: number;
  demandLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK';
  priceMultiplier: number;
  minPrice?: number;
  maxPrice?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemWithDynamicPrice {
  id: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  surgePercent: number;
  isSurged: boolean;
  category: string;
  image?: string;
  description?: string;
}

export interface DynamicMenuResponse {
  menu: Record<string, MenuItemWithDynamicPrice[]>;
  demandLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK';
  hour: number;
  timestamp: string;
}

export interface ItemPriceResponse {
  itemId: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  demandLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK';
  surgePercent: number;
  timestamp: string;
}

export interface DemandForecast {
  date: string;
  dayOfWeek: string;
  predictedOccupancy: number;
  suggestedPriceMultiplier: number;
  confidence: number;
}

export interface DemandForecastResponse {
  forecast: DemandForecast[];
  generatedAt: string;
}

export interface PricingRule {
  id: string;
  menuItemId: string;
  timeRange: string;
  dayOfWeek: number;
  demandLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK';
  priceMultiplier: number;
  minPrice?: number;
  maxPrice?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  menuItem?: {
    name: string;
    price: number;
  };
}

export interface PricingAnalytics {
  totalItemsWithPricing: number;
  itemsWithSurge: number;
  regularRevenue: number;
  surgedRevenue: number;
  totalPotentialRevenue: number;
  surgeContributionPercent: number;
  currentDemandLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK';
  currentHour: number;
}

/**
 * Loyalty Types
 */
export interface LoyaltyProfile {
  points: number;
  tier: 'SILVER' | 'GOLD' | 'PLATINUM';
  totalSpent: number;
  tierProgression: {
    current: 'SILVER' | 'GOLD' | 'PLATINUM';
    next: 'GOLD' | 'PLATINUM' | null;
    pointsToNextTier: number | null;
    progressPercent: number;
  };
  benefits: {
    pointMultiplier: number;
    rewardsAvailable: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  pointsCost: number;
  discount?: number;
  freeItem?: string;
  validUntil: string;
  totalLimit?: number;
  perUserLimit: number;
  claimCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SOLD_OUT';
  canRedeem?: boolean;
  available?: boolean;
  daysUntilExpiry?: number;
}

export interface RewardsResponse {
  rewards: Reward[];
  userPoints: number;
  userTier: 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'REDEEMED' | 'CANCELLED' | 'EXPIRED';
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RedeemRewardResponse {
  message: string;
  redemption: RewardRedemption;
  pointsRemaining: number;
  reward: {
    name: string;
    discount?: number;
    freeItem?: string;
  };
}

export interface ReferralCode {
  referralCode: string;
  referralLink: string;
  bonusPoints: number;
  message: string;
}

/**
 * Notification Types
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  status: NotificationStatus;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum NotificationType {
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_READY = 'ORDER_READY',
  ORDER_SERVED = 'ORDER_SERVED',
  RESERVATION_CONFIRMED = 'RESERVATION_CONFIRMED',
  RESERVATION_REMINDER_24H = 'RESERVATION_REMINDER_24H',
  RESERVATION_REMINDER_1H = 'RESERVATION_REMINDER_1H',
  WAITLIST_SEATED = 'WAITLIST_SEATED',
  WAITLIST_APPROACHING = 'WAITLIST_APPROACHING',
  LOYALTY_MILESTONE = 'LOYALTY_MILESTONE',
  REWARD_AVAILABLE = 'REWARD_AVAILABLE',
  PROMOTION = 'PROMOTION',
  FEEDBACK_REQUEST = 'FEEDBACK_REQUEST',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

export interface NotificationPreference {
  id: string;
  userId: string;
  emailNotifs: boolean;
  smsNotifs: boolean;
  pushNotifs: boolean;
  promotions: boolean;
  orderUpdates: boolean;
  reservationReminders: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
}

export interface NotificationStats {
  today: string;
  totalSent: number;
  totalFailed: number;
  deliveryRate: string;
  byType: Array<{
    type: NotificationType;
    _count: number;
  }>;
  currentlyUnread: number;
}
