# Phase 11 Frontend Implementation Guide

## Overview

This guide covers the complete Phase 11 frontend implementation with 14 production-ready components and 4 custom hooks for managing advanced features:

- **Waitlist Management** - Queue system with real-time tracking
- **Dynamic Pricing** - Real-time menu price adjustments and analytics
- **Loyalty Rewards** - Tier system with points, rewards, and referrals
- **Automated Notifications** - Multi-channel notifications with preferences

---

## Component Structure

### Components by Feature

#### 1. Waitlist Management (3 Components)

**WaitlistJoinForm.tsx** (`frontend/components/waitlist/`)
- Allows customers to join the waitlist
- Input: Guest count (1-20), preferred time (min 15 min from now)
- Output: Position number, estimated wait time
- Features:
  - Form validation
  - Success state with position display
  - "Check Status" link to track
  - Error handling for duplicate entries

```tsx
import WaitlistJoinForm from '@/components/waitlist/WaitlistJoinForm';

export default function WaitlistPage() {
  return <WaitlistJoinForm />;
}
```

**WaitlistStatus.tsx** (`frontend/components/waitlist/`)
- Real-time position tracking
- Auto-refresh every 30 seconds
- Display: Position, estimated wait, party size, priority score
- Actions: "I'm Here!" button, Cancel button
- Stores current waitlist ID in localStorage

```tsx
import WaitlistStatus from '@/components/waitlist/WaitlistStatus';

export default function StatusPage() {
  return <WaitlistStatus />;
}
```

**WaitlistManagement.tsx** (`frontend/components/waitlist/`)
- Admin dashboard for waitlist management
- Features:
  - Statistics cards (currently waiting, seated today, avg wait, peak hours)
  - Filter tabs (all, waiting, seated, cancelled)
  - Action buttons: Seat Now, Remove
  - Real-time list updates
- Endpoints: GET /api/v1/waitlist/admin/list, /stats

```tsx
import WaitlistManagement from '@/components/waitlist/WaitlistManagement';

export default function AdminWaitlistPage() {
  return <WaitlistManagement />;
}
```

---

#### 2. Dynamic Pricing (4 Components)

**MenuPriceDisplay.tsx** (`frontend/components/pricing/`)
- Customer-facing dynamic menu with real-time prices
- Features:
  - Demand level indicator (LOW/MEDIUM/HIGH/PEAK)
  - Base price→ Current price display
  - Surge percentage badge
  - Color-coded demand levels
- Usage:

```tsx
import MenuPriceDisplay from '@/components/pricing/MenuPriceDisplay';

export default function MenuPage() {
  return <MenuPriceDisplay />;
}
```

**DemandForecast.tsx** (`frontend/components/pricing/`)
- Admin 7-day demand forecast visualization
- Features:
  - Daily cards with occupancy percentage
  - Price multiplier suggestions
  - Confidence scores
  - Summary statistics (busiest day, avg occupancy)
- Admin only

```tsx
import DemandForecast from '@/components/pricing/DemandForecast';

// Protect route with admin check
export default function ForecastPage() {
  return <DemandForecast />;
}
```

**PricingAnalytics.tsx** (`frontend/components/pricing/`)
- Admin revenue and surge pricing analytics
- Features:
  - Revenue metrics (total, regular, surge)
  - Item statistics (surged items count, % active)
  - Surge contribution analysis
  - Dynamic recommendations based on demand
- Admin only

```tsx
import PricingAnalytics from '@/components/pricing/PricingAnalytics';

export default function AnalyticsPage() {
  return <PricingAnalytics />;
}
```

**PricingRules.tsx** (`frontend/components/pricing/`)
- Admin interface for creating/editing pricing rules
- Features:
  - CRUD operations for pricing rules
  - Time range selector (BREAKFAST, LUNCH, DINNER, PEAK)
  - Day of week selector
  - Demand level selector (LOW, MEDIUM, HIGH, PEAK)
  - Price multiplier slider with % display
  - Min/max price caps
- Admin only

```tsx
import PricingRules from '@/components/pricing/PricingRules';

export default function RulesPage() {
  return <PricingRules />;
}
```

---

#### 3. Loyalty Rewards (4 Components)

**LoyaltyDashboard.tsx** (`frontend/components/loyalty/`)
- Customer loyalty tier and points display
- Features:
  - Current tier display (SILVER/GOLD/PLATINUM)
  - Total points balance
  - Tier-specific benefits grid
  - Tier progression bar (if not at max)
  - Point multiplier display
- Customer only

```tsx
import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';

export default function DashboardPage() {
  return <LoyaltyDashboard />;
}
```

**RewardsShop.tsx** (`frontend/components/loyalty/`)
- Browse and redeem available rewards
- Features:
  - Reward cards with availability
  - Points cost display
  - Affordability check (lock icon if insufficient points)
  - SOLD OUT overlay for exhausted rewards
  - Points earning guide table
- Customer only

```tsx
import RewardsShop from '@/components/loyalty/RewardsShop';

export default function ShopPage() {
  return <RewardsShop />;
}
```

**LoyaltyHistory.tsx** (`frontend/components/loyalty/`)
- Redemption history timeline
- Features:
  - Summary stats (total earned, total redeemed, count)
  - Chronological redemption list
  - Status color-coding
  - Pagination (10 items per load)
- Customer only

```tsx
import LoyaltyHistory from '@/components/loyalty/LoyaltyHistory';

export default function HistoryPage() {
  return <LoyaltyHistory />;
}
```

**ReferralProgram.tsx** (`frontend/components/loyalty/`)
- Referral code generation and sharing
- Features:
  - Generate personal referral code
  - Copy to clipboard with feedback
  - Share via Email, Facebook, Twitter
  - Apply friend's referral code
  - How it works guide (3-step diagram)
  - 50 bonus points per referral
- Customer only

```tsx
import ReferralProgram from '@/components/loyalty/ReferralProgram';

export default function ReferralPage() {
  return <ReferralProgram />;
}
```

---

#### 4. Notifications (3 Components)

**NotificationCenter.tsx** (`frontend/components/notifications/`)
- Full notification management interface
- Features:
  - List all notifications with unread badge
  - Filter tabs (all, types, status)
  - Mark as read action
  - Delete notification
  - Pagination with "Load More"
  - Auto-refresh every 30 seconds
- Customer only

```tsx
import NotificationCenter from '@/components/notifications/NotificationCenter';

export default function NotificationsPage() {
  return <NotificationCenter />;
}
```

**NotificationBell.tsx** (`frontend/components/notifications/`)
- Dropdown bell icon with recent notifications
- Features:
  - Unread count badge
  - Preview of 5 most recent notifications
  - Mark as read from dropdown
  - Auto-refresh every 15 seconds
  - Link to NotificationCenter
  - Overlay close on click outside
- Use in header/navbar

```tsx
import NotificationBell from '@/components/notifications/NotificationBell';

export default function NavBar() {
  return (
    <header>
      {/* ... other navbar items ... */}
      <NotificationBell />
    </header>
  );
}
```

**NotificationSettings.tsx** (`frontend/components/notifications/`)
- Notification preferences configuration
- Features:
  - Toggle per channel (email, SMS, push)
  - Notification type selection (6 types)
  - Test notification buttons per channel
  - Save/Cancel functionality
  - Loading and error states
- Customer only

```tsx
import NotificationSettings from '@/components/notifications/NotificationSettings';

export default function SettingsPage() {
  return <NotificationSettings />;
}
```

---

## Custom Hooks

### useWaitlist

Manage waitlist state and operations.

```tsx
import { useWaitlist } from '@/hooks/useWaitlist';
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { token } = useAuth();
  const {
    waitlistEntry,    // Current waitlist entry
    loading,          // Loading state
    error,            // Error message
    joinWaitlist,     // Async: join queue
    getStatus,        // Async: get current status
    cancelWaitlist,   // Async: cancel entry
    clearError,       // Clear error message
  } = useWaitlist(token);

  const handleJoin = async () => {
    const entry = await joinWaitlist(4, '2024-02-15T19:00:00');
    if (entry) {
      console.log(`Position: ${entry.position}`);
    }
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <button onClick={handleJoin} disabled={loading}>
        {loading ? 'Joining...' : 'Join Waitlist'}
      </button>
    </div>
  );
}
```

### usePricing

Manage dynamic pricing and menu data.

```tsx
import { usePricing } from '@/hooks/usePricing';
import { useAuth } from '@/hooks/useAuth';

export default function PricingComponent() {
  const { token } = useAuth();
  const {
    menu,              // Current menu items with prices
    forecast,          // 7-day demand forecast
    loading,           // Loading state
    error,             // Error message
    getDynamicMenu,    // Async: get menu with prices
    getItemPrice,      // Async: get single item price
    getDemandForecast, // Async: get 7-day forecast
    getAnalytics,      // Async: get pricing analytics
    clearError,        // Clear error
  } = usePricing(token);

  useEffect(() => {
    getDynamicMenu();
  }, [token]);

  return (
    <div>
      {menu.map((item) => (
        <div key={item.id}>
          <p>{item.name}</p>
          <p>${item.currentPrice?.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
```

### useLoyalty

Manage loyalty profile, rewards, and referrals.

```tsx
import { useLoyalty } from '@/hooks/useLoyalty';
import { useAuth } from '@/hooks/useAuth';

export default function LoyaltyComponent() {
  const { token } = useAuth();
  const {
    profile,                  // LoyaltyProfile info
    rewards,                  // Available rewards
    loading,                  // Loading state
    error,                    // Error message
    getProfile,               // Async: get profile
    getAvailableRewards,      // Async: get rewards
    redeemReward,             // Async: redeem reward
    getHistory,               // Async: redemption history
    generateReferralCode,     // Async: create code
    useReferralCode,          // Async: apply code
    clearError,               // Clear error
  } = useLoyalty(token);

  useEffect(() => {
    getProfile();
    getAvailableRewards();
  }, [token]);

  const handleRedeem = async (rewardId: string) => {
    const result = await redeemReward(rewardId);
    // Profile auto-refreshed
  };

  return (
    <div>
      <p>Tier: {profile?.tier}</p>
      <p>Points: {profile?.totalPoints}</p>
      {rewards.map((reward) => (
        <button key={reward.id} onClick={() => handleRedeem(reward.id)}>
          Redeem {reward.name}
        </button>
      ))}
    </div>
  );
}
```

### useNotifications

Manage notifications and preferences.

```tsx
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

export default function NotificationsComponent() {
  const { token } = useAuth();
  const {
    notifications,          // List of notifications
    preferences,            // User preferences
    unreadCount,            // Number of unread
    loading,                // Loading state
    error,                  // Error message
    getNotifications,       // Async: get list (paginated)
    markAsRead,             // Async: mark single as read
    deleteNotification,     // Async: delete notification
    getPreferences,         // Async: get preferences
    updatePreferences,      // Async: save preferences
    sendTestNotification,   // Async: send test
    clearError,             // Clear error
  } = useNotifications(token);

  useEffect(() => {
    getNotifications(1, 10); // Page 1, 10 items
  }, [token]);

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map((notif) => (
        <div key={notif.id}>
          <h4>{notif.title}</h4>
          <button onClick={() => markAsRead(notif.id)}>Mark Read</button>
        </div>
      ))}
    </div>
  );
}
```

---

## Integration with Service Layer

All components use the Phase 11 service layer for type-safe API communication. The service methods are pre-configured with error handling and token management.

### Available Service Objects

```typescript
import {
  waitlistService,
  pricingService,
  loyaltyService,
  notificationService,
} from '@/services/phase11Service';

// Each service has multiple methods for database CRUD and business logic
```

---

## Dashboard Page Layout Examples

### Customer Dashboard

```tsx
// app/dashboard/page.tsx
'use client';

import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';
import NotificationBell from '@/components/notifications/NotificationBell';
import WaitlistStatus from '@/components/waitlist/WaitlistStatus';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <NotificationBell />
      </div>

      <LoyaltyDashboard />
      <WaitlistStatus />
    </div>
  );
}
```

### Admin Dashboard

```tsx
// app/dashboard/admin/page.tsx
'use client';

import WaitlistManagement from '@/components/waitlist/WaitlistManagement';
import DemandForecast from '@/components/pricing/DemandForecast';
import PricingAnalytics from '@/components/pricing/PricingAnalytics';
import PricingRules from '@/components/pricing/PricingRules';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <WaitlistManagement />
      <DemandForecast />
      <PricingAnalytics />
      <PricingRules />
    </div>
  );
}
```

---

## Styling & Dependencies

### Required UI Libraries
- **shadcn/ui** - Card, Button, Input components
- **lucide-react** - Icons throughout
- **Tailwind CSS** - Already configured

### Component Features
- Fully responsive (mobile, tablet, desktop)
- Dark mode compatible (via Tailwind)
- Accessible (ARIA labels, semantic HTML)
- Loading states with animate-pulse
- Error handling with AlertCircle icon display
- Success feedback with Check icon

---

## Configuration & Environment

### Required Backend Endpoints

Ensure all Phase 11 API endpoints are available:

**Waitlist Routes**
- `POST /api/v1/waitlist/join`
- `GET /api/v1/waitlist/status/:id`
- `DELETE /api/v1/waitlist/cancel/:id`
- `GET /api/v1/waitlist/admin/list`
- `GET /api/v1/waitlist/admin/stats`
- `POST /api/v1/waitlist/admin/seat/:id`
- `DELETE /api/v1/waitlist/admin/remove/:id`

**Pricing Routes**
- `GET /api/v1/pricing/menu`
- `GET /api/v1/pricing/item/:id`
- `GET /api/v1/pricing/forecast`
- `GET /api/v1/pricing/analytics`
- `POST /api/v1/pricing/rules`
- `PUT /api/v1/pricing/rules/:id`
- `DELETE /api/v1/pricing/rules/:id`

**Loyalty Routes**
- `GET /api/v1/loyalty/profile`
- `GET /api/v1/loyalty/rewards`
- `POST /api/v1/loyalty/redeem/:rewardId`
- `GET /api/v1/loyalty/history`
- `POST /api/v1/loyalty/referral/generate`
- `POST /api/v1/loyalty/referral/use`

**Notification Routes**
- `GET /api/v1/notifications`
- `PUT /api/v1/notifications/:id/read`
- `DELETE /api/v1/notifications/:id`
- `GET /api/v1/notifications/preferences`
- `PUT /api/v1/notifications/preferences`
- `POST /api/v1/notifications/test/:channel`

---

## Best Practices

### Error Handling
```tsx
const { error, clearError } = useWaitlist(token);

if (error) {
  return (
    <div className="bg-red-50 p-4 rounded">
      <p>{error}</p>
      <button onClick={clearError}>Dismiss</button>
    </div>
  );
}
```

### Loading States
```tsx
const { loading } = usePricing(token);

return (
  <div>
    {loading ? (
      <div className="animate-pulse space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded" />)}
      </div>
    ) : (
      // Content
    )}
  </div>
);
```

### Token Management
All components automatically use the token from `useAuth()` hook. Ensure:
1. User is logged in before accessing protected components
2. Token is valid and fresh (refresh if expired)
3. Admin routes check token payload for admin role

---

## Testing Components

Each component has been created with:
- TypeScript for type safety
- Error boundaries for graceful error handling
- Loading states for better UX
- Real-time features (polling/intervals)
- Responsive design tested at 320px, 768px, 1024px, 1440px widths

### Manual Testing Checklist
- [ ] Component loads without token → shows error or redirects
- [ ] Loading state displays correctly
- [ ] API data renders as expected
- [ ] Error handling shows user-friendly messages
- [ ] Buttons and forms are interactive
- [ ] Mobile responsiveness works
- [ ] Dark mode styling cascades correctly

---

## Next Steps

1. **Create Dashboard Pages** - Wrap components in page.tsx files
2. **Add Navigation** - Update navbar/sidenav with links
3. **Deploy Backend** - Ensure all API endpoints are live
4. **Run End-to-End Tests** - Test full user flows
5. **Production Deployment** - Build and deploy Next.js app

---

## Support & Documentation

For detailed API documentation, see `BACKEND_API_GUIDE.md`.
For Phase 11 backend implementation details, see `PHASE_11_STATUS.md`.
For quick setup, see `QUICK_START_GUIDE.md`.
