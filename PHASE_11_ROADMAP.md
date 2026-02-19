# Phase 11: Advanced Features Implementation Roadmap

**Status**: 🚀 STARTING  
**Target Completion**: February 15-20, 2026  
**Estimated Effort**: 40-50 hours  
**Team Impact**: High - Unlocks premium features and automation

---

## Overview

Phase 11 introduces four advanced feature sets that enhance customer experience, optimize revenue, and automate operations:

1. **Waitlist Management** - Queue customers during peak times
2. **Dynamic Pricing Engine** - Adjust prices based on demand
3. **Loyalty Rewards Program** - Drive customer retention
4. **Automated Notifications** - Email/SMS alerts for customers

---

## 1. Waitlist Management System

### Purpose
Enable customers to join a digital queue when tables are unavailable, receive notifications when tables become available, and prioritize seating based on loyalty and wait time.

### Database Model (Prisma)
**Already exists** - `Waitlist` model ready:
```prisma
model Waitlist {
  id        String   @id @default(cuid())
  userId    String
  guestCount Int
  preferredTime DateTime
  priority  Int
  status    WaitlistStatus @default(WAITING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Backend (7 endpoints)
```
POST   /api/v1/waitlist/join              - Add to waitlist
GET    /api/v1/waitlist/status/:id        - Check position
PUT    /api/v1/waitlist/:id/cancel        - Cancel waitlist entry
GET    /api/v1/waitlist/admin/list        - View all waiting (admin)
PUT    /api/v1/waitlist/:id/seat          - Move to seated (admin)
GET    /api/v1/waitlist/admin/stats       - Waitlist metrics (admin)
DELETE /api/v1/waitlist/:id/remove        - Remove expired entry (admin)
```

### Business Logic
**Priority Calculation Algorithm**:
```
priority = (loyaltyTier × 10) + (waitTime × 1) + (referralBonus × 5)

Example:
- Gold member (10) + waiting 30 mins (30) + referred friend (5) = 45 points
```

**Automatic Notifications**:
- ✉️ When seat available (SMS/Email)
- ✉️ When approaching front (15 min notice)
- ✉️ When expire from list (24 hours)

### Frontend Components (3 components)
1. **WaitlistJoinForm.tsx**
   - Guest count selector
   - Preferred time picker
   - Phone/email verification
   - Estimated wait time display

2. **WaitlistStatus.tsx**
   - Current position in queue
   - Your priority score
   - Estimated seating time
   - Cancel button
   - Live position updates (WebSocket)

3. **WaitlistManagement.tsx** (Admin)
   - List of waiting customers
   - Priority sorting
   - Seat button action
   - Manual priority adjustment
   - Bulk operations

### Files to Create
- Backend: `waitlistController.ts`, `waitlist.ts` routes
- Frontend: 3 components + 1 hook + 1 service
- Types: `waitlist.ts` interfaces

---

## 2. Dynamic Pricing Engine

### Purpose
Maximize revenue by adjusting menu prices based on:
- Peak vs. off-peak hours
- Day of week
- Demand levels
- Special events
- Seasonal factors

### Database Models (New)
```prisma
model DynamicPrice {
  id          String   @id @default(cuid())
  menuItemId  String
  timeRange   String // "11:00-15:00" (lunch)
  dayOfWeek   Int // 0=Sun, 6=Sat
  demandLevel DemandLevel
  priceMultiplier Float // 1.0 = normal, 1.25 = 25% increase
  minPrice    Float?
  maxPrice    Float?
  status      PriceStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  menuItem MenuItem @relation(fields: [menuItemId], references: [id])
}

enum PriceStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### Backend (8 endpoints)
```
GET    /api/v1/pricing/menu              - Get dynamic menu with prices
GET    /api/v1/pricing/item/:id          - Get item price (current time)
GET    /api/v1/pricing/forecast          - Forecast demand next 7 days
POST   /api/v1/pricing/rules              - Create pricing rule (admin)
GET    /api/v1/pricing/rules              - List all rules (admin)
PUT    /api/v1/pricing/rules/:id          - Update rule (admin)
DELETE /api/v1/pricing/rules/:id          - Delete rule (admin)
GET    /api/v1/pricing/analytics          - Revenue impact (admin)
```

### Pricing Algorithm
```typescript
const calculatePrice = (basePrice: Float, hour: Int, dayOfWeek: Int, demand: DemandLevel) => {
  let multiplier = 1.0;
  
  // Peak hour multiplier
  if (hour >= 12 && hour <= 14) multiplier *= 1.15; // lunch rush
  if (hour >= 19 && hour <= 21) multiplier *= 1.25; // dinner peak
  
  // Day of week multiplier
  if (dayOfWeek === 5 || dayOfWeek === 6) multiplier *= 1.10; // weekend
  
  // Demand-based multiplier
  if (demand === 'HIGH') multiplier *= 1.20;
  if (demand === 'PEAK') multiplier *= 1.35;
  
  // Cap between min and max
  return Math.min(Math.max(basePrice * multiplier, minPrice), maxPrice);
}
```

### Demand Forecast (ML-ready)
- Uses historical PeakHourStatistics
- Predicts demand for next 7 days
- Updates prices dynamically every hour

### Frontend Components (4 components)
1. **PricingAnalytics.tsx**
   - Price trends over time
   - Demand level chart
   - Revenue impact visualization
   - Historical data

2. **PricingRules.tsx** (Admin)
   - List/Create/Edit/Delete rules
   - Time range picker
   - Multiplier slider
   - Day selector

3. **DemandForecast.tsx** (Admin)
   - 7-day demand forecast
   - Suggested price adjustments
   - Confidence scores

4. **MenuPriceDisplay.tsx**
   - Show dynamic prices on menu
   - Highlight surge pricing
   - Time-based discount indicators

### Files to Create
- Backend: `pricingController.ts`, `pricing.ts` routes, (extend schema)
- Frontend: 4 components + service + types
- Algorithm: `dynamicPricingAlgorithm.ts`

---

## 3. Loyalty Rewards Program

### Purpose
Reward customer loyalty and drive repeat business through:
- Points earning (order, referral, review)
- Tiered membership (Silver → Gold → Platinum)
- Exclusive rewards redemption
- Referral bonuses

### Database Models (Extend Existing)
```prisma
// Update existing LoyaltyPoints
model LoyaltyPoints {
  id          String   @id @default(cuid())
  userId      String   @unique
  points      Int @default(0)
  tier        String @default("SILVER") // SILVER, GOLD, PLATINUM
  totalSpent  Float @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  redemptions RewardRedemption[]
}

// NEW: Reward Catalog
model RewardCatalog {
  id          String   @id @default(cuid())
  name        String // "Free Appetizer", "20% Discount"
  description String?
  pointsCost  Int
  discount    Float?
  freeItem    String? // MenuItem ID
  validUntil  DateTime
  totalLimit  Int? // Max claims
  perUserLimit Int @default(1)
  claimCount  Int @default(0)
  status      RewardStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  
  redemptions RewardRedemption[]
}

enum RewardStatus {
  ACTIVE
  INACTIVE
  EXPIRED
  SOLD_OUT
}

// NEW: Reward Redemption
model RewardRedemption {
  id          String   @id @default(cuid())
  userId      String
  rewardId    String
  pointsStored Int
  status      RedemptionStatus @default(REDEEMED)
  orderId     String?
  createdAt   DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  reward RewardCatalog @relation(fields: [rewardId], references: [id])
}

enum RedemptionStatus {
  REDEEMED
  CANCELLED
  EXPIRED
}
```

### Point Earning Rules
```
- Order: 1 point per $1 spent
- Referral: 50 points (both get)
- Review: 25 points
- Birthday: 100 bonus points
- Tier upgrade: 500 bonus points
```

### Tier Benefits
```
SILVER (0-500 points):
- 1 point = $1 spent
- 5% birthday discount
- Early reservation access

GOLD (500-2000 points):
- 1.5x point multiplier
- 10% birthday discount
- VIP table priority
- Free appetizer once/month

PLATINUM (2000+ points):
- 2x point multiplier
- 20% birthday discount
- VIP lounge access
- Free meal once/quarter
- Personal concierge
```

### Backend (9 endpoints)
```
GET    /api/v1/loyalty/profile           - User points & tier
GET    /api/v1/loyalty/rewards           - Available rewards
POST   /api/v1/loyalty/redeem/:rewardId  - Redeem reward
GET    /api/v1/loyalty/history           - Points history
POST   /api/v1/loyalty/referral/share    - Generate referral code
POST   /api/v1/loyalty/referral/use      - Use referral code
POST   /api/v1/rewards/create (admin)    - Create reward
GET    /api/v1/rewards/list (admin)      - List rewards
DELETE /api/v1/rewards/:id (admin)       - Delete reward
```

### Frontend Components (4 components)
1. **LoyaltyDashboard.tsx**
   - Points balance
   - Current tier
   - Progress to next tier
   - Milestone achievements

2. **RewardsShop.tsx**
   - Available rewards
   - Cost in points
   - Filter by tier
   - Redeem button

3. **LoyaltyHistory.tsx**
   - Points earned/spent log
   - Date ranges
   - Reason breakdown

4. **ReferralProgram.tsx**
   - Referral link sharing
   - Referral code display
   - Referral bonus tracking
   - Leaderboard

### Files to Create
- Backend: `loyaltyController.ts`, `loyalty.ts` routes, (extend schema)
- Frontend: 4 components + service + types
- Service: `loyaltyService.ts` with tier calculation

---

## 4. Automated Notifications (Email/SMS)

### Purpose
Keep customers informed about:
- Order status updates
- Reservation confirmations
- Waitlist position
- Loyalty milestone achievements
- Marketing promotions

### New Services
```
Email: Nodemailer + AWS SES
SMS: Twilio API
In-app: WebSocket notifications
```

### Database Models (New)
```prisma
model NotificationPreference {
  id          String   @id @default(cuid())
  userId      String   @unique
  emailNotifs Boolean @default(true)
  smsNotifs   Boolean @default(false)
  pushNotifs  Boolean @default(true)
  promotions  Boolean @default(true)
  orderUpdates Boolean @default(true)
  reservationReminders Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Notification {
  id          String   @id @default(cuid())
  userId      String
  type        NotificationType
  title       String
  message     String
  data        Json? // Context payload
  status      NotificationStatus @default(PENDING)
  sentAt      DateTime?
  readAt      DateTime?
  createdAt   DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum NotificationType {
  ORDER_CONFIRMED
  ORDER_READY
  ORDER_SERVED
  RESERVATION_CONFIRMED
  RESERVATION_REMINDER_24H
  RESERVATION_REMINDER_1H
  WAITLIST_SEATED
  WAITLIST_APPROACHING
  LOYALTY_MILESTONE
  REWARD_AVAILABLE
  PROMOTION
  FEEDBACK_REQUEST
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  BOUNCED
}
```

### Notification Triggers
```
Order Events:
  - Order Confirmed → Email + SMS + In-app
  - Order Ready → SMS + In-app (priority)
  - Order Served → In-app

Reservation Events:
  - Reservation Confirmed → Email + SMS
  - 24h before → Email reminder
  - 1h before → SMS reminder

Waitlist Events:
  - Added to waitlist → Email + SMS
  - Table approaching → SMS alert
  - Table available → SMS + In-app (urgent)
  
Loyalty Events:
  - Points earned → In-app
  - Tier upgrade → Email + SMS
  - Reward available → Email + In-app
  
Marketing:
  - Weekly specials → Email
  - Birthday offer → Email + SMS
```

### Backend (8 endpoints)
```
GET    /api/v1/notifications              - Get user notifications
POST   /api/v1/notifications/:id/read     - Mark as read
DELETE /api/v1/notifications/:id          - Delete notification
GET    /api/v1/preferences/notifications  - Get preferences
PUT    /api/v1/preferences/notifications  - Update preferences
POST   /api/v1/notifications/send (admin) - Send custom notification
GET    /api/v1/notifications/stats (admin) - Sent/Delivery stats
POST   /api/v1/notifications/test (admin) - Send test notification
```

### Frontend Components (3 components)
1. **NotificationCenter.tsx**
   - List of notifications
   - Mark as read
   - Delete
   - Filters (order, reservation, loyalty)

2. **NotificationBell.tsx**
   - Unread count badge
   - Dropdown preview
   - WebSocket integration for real-time

3. **NotificationSettings.tsx**
   - Toggle email/SMS/push
   - Preference granularity
   - Unsubscribe options

### Service Integration
```typescript
// Email Service (Nodemailer)
async sendOrderConfirmation(email, order)
async sendReservationReminder(email, reservation)

// SMS Service (Twilio)
async sendWaitlistAlert(phone, position)
async sendOrderReady(phone, orderId)

// WebSocket Service
broadcastNotification(userId, notification)

// Template Service
getEmailTemplate(type, data)
getSMSTemplate(type, data)
```

### Files to Create
- Backend: `notificationController.ts`, `notification.ts` routes, (extend schema)
- Services: `emailService.ts`, `smsService.ts`, `notificationService.ts`
- Templates: `notifications/` folder with email/SMS templates
- Frontend: 3 components + service + types
- Integration: Event listeners in order/reservation/waitlist controllers

---

## Implementation Sequence

### Week 1 (Feb 13-15)
1. **Day 1**: Waitlist Management
   - Backend controller (2-3 hours)
   - Frontend components (2-3 hours)
   - Testing (1 hour)

2. **Day 2**: Dynamic Pricing
   - Extend Prisma schema (1 hour)
   - Backend controller (3-4 hours)
   - Frontend components (2-3 hours)
   - Algorithm implementation (1-2 hours)

3. **Day 3**: Loyalty Rewards
   - Extend Prisma schema (1 hour)
   - Backend controller (2-3 hours)
   - Frontend components (2-3 hours)
   - Service layer (1-2 hours)

### Week 2 (Feb 14-20)
1. **Day 4**: Notifications
   - Extend Prisma schema (1 hour)
   - Email/SMS service setup (2 hours)
   - Backend controller (2-3 hours)
   - Templates (1-2 hours)

2. **Day 5**: Integration
   - Connect all services (2-3 hours)
   - Frontend for notifications (2 hours)
   - WebSocket integration (1-2 hours)

3. **Day 6-7**: Testing & Documentation
   - End-to-end testing (3-4 hours)
   - Documentation (3-4 hours)
   - Demo preparation (1-2 hours)

---

## Technical Details

### Dependencies to Add
```json
{
  "nodemailer": "^6.9.0",
  "twilio": "^4.10.0",
  "@sendgrid/mail": "^8.1.0",
  "node-schedule": "^2.1.0",
  "socket.io-client": "^4.7.0"
}
```

### Environment Variables
```
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid (alternative)
SENDGRID_API_KEY=your-api-key
```

---

## Success Metrics

### Waitlist Management
- ✅ 50+ concurrent waitlist entries
- ✅ <2 second position updates
- ✅ 100% notification delivery
- ✅ Reduce peak-time walk-aways by 30%

### Dynamic Pricing
- ✅ Real-time price calculations
- ✅ Revenue increase by 15-25%
- ✅ Demand prediction accuracy >80%
- ✅ Customer acceptance >70%

### Loyalty Rewards
- ✅ 40%+ customer enrollment
- ✅ 20% increase in repeat visits
- ✅ Average tier upgrade in 6 months
- ✅ $500+ referral value per customer

### Notifications
- ✅ 95%+ delivery rate
- ✅ <1 minute delivery time
- ✅ 40%+ email open rate
- ✅ 80%+ SMS read rate
- ✅ 60%+ opt-in rate

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| SMS delivery delays | Use Twilio + fallback email |
| Email spam folder | Use SendGrid/AWS SES reputation |
| Algorithm complexity | Unit tests + performance monitoring |
| Notification overload | Preference granularity + rate limiting |
| Database performance | Index creation + caching |

### Business Risks
| Risk | Mitigation |
|------|-----------|
| Customer notification fatigue | Preference controls |
| Pricing controversy | Gradual rollout + transparency |
| Reward budget | Limit per-user redemptions |
| Notification opt-out | Ensure compliance + value |

---

## Testing Plan

### Unit Tests
- Pricing algorithm (20+ test cases)
- Loyalty tier calculations (15+ test cases)
- Points earning rules (12+ test cases)
- Notification templates (10+ test cases)

### Integration Tests
- Order → Notification flow
- Pricing → Menu price update
- Waitlist → Table assignment → Notification
- Referral → Points credit

### Performance Tests
- 100+ concurrent API requests
- 1000+ notifications queue
- Real-time WebSocket updates

### User Acceptance Testing
- Mobile notification delivery
- Email rendering (Gmail, Outlook, Apple)
- SMS character encoding
- Pricing display accuracy

---

## Documentation Deliverables

1. **PHASE_11_IMPLEMENTATION_GUIDE.md**
   - Complete technical reference
   - API endpoints (32 total)
   - Database corrections
   - Setup instructions

2. **PHASE_11_QUICK_START.md**
   - Quick feature overview
   - 5-minute setup
   - Common tasks

3. **WAITLIST_GUIDE.md**
   - Feature walkthrough
   - Admin operations
   - Troubleshooting

4. **PRICING_ENGINE_GUIDE.md**
   - Algorithm explanation
   - Configuration options
   - Optimization tips

5. **LOYALTY_REWARDS_GUIDE.md**
   - Program structure
   - Tier benefits
   - Redemption process

6. **NOTIFICATIONS_GUIDE.md**
   - Setup (email/SMS)
   - Templates
   - Testing notifications

7. **PHASE_11_SUMMARY.md**
   - Completion report
   - Statistics
   - Lessons learned

---

## Progress Tracking

```
Week 1: 0% → 60% (Waitlist, Pricing, Loyalty core)
Week 2: 60% → 100% (Notifications, Integration, Testing)

Phase 11 Completion: February 20, 2026
Project Completion: 92% (11/12 phases)
```

---

## Questions & Notes

- ❓ Which notification service preferred? (Nodemailer, SendGrid, Twilio)
- ❓ Image storage for loyalty badges? (S3, local, cloudinary)
- ❓ Loyalty migration from existing points? (Data seeding)
- ❓ SMS cost budget? (Prioritize order-critical alerts)

---

## Conclusion

Phase 11 transforms the platform from functional to exceptional:
- **Waitlist** = 30% reduction in customer frustration
- **Dynamic Pricing** = 15-25% revenue increase
- **Loyalty** = Repeat customers (+40%)
- **Notifications** = Engagement (+60%)

**Ready to begin implementation!** 🚀
