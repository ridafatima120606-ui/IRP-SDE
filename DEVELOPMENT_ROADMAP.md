# Smart Dining System - Development Roadmap

## Phase 1: Authentication & Core Infrastructure ✅ SETUP COMPLETE

### Completed in Setup Phase:
- ✅ Project scaffolding (Frontend + Backend + Docker)
- ✅ Database schema design (Prisma)
- ✅ Authentication utilities (JWT, bcrypt)
- ✅ Middleware setup (Auth, Validation, Error handling)
- ✅ Frontend service layer (API client)
- ✅ Custom React hooks (useAuth)
- ✅ Docker configuration

### Next Tasks: Phase 2 - Authentication Implementation

#### Task 2.1: Backend Authentication Controller
**File**: `backend/src/controllers/authController.ts`

```typescript
// Register user
POST /api/v1/auth/register

// Login user  
POST /api/v1/auth/login

// Logout user
POST /api/v1/auth/logout

// Get current user
GET /api/v1/auth/me

// Google OAuth login
POST /api/v1/auth/google
```

#### Task 2.2: Backend Authentication Routes
**File**: `backend/src/routes/auth.ts`

- Wire up all auth controller methods
- Add validation middleware
- Add error handling

#### Task 2.3: Frontend Authentication Pages
**Files**:
- `frontend/app/auth/login/page.tsx`
- `frontend/app/auth/register/page.tsx`
- `frontend/components/auth/LoginForm.tsx`
- `frontend/components/auth/RegisterForm.tsx`

#### Task 2.4: Protected Routes & Auth Context
**Files**:
- `frontend/lib/withAuth.tsx` - Protected route wrapper
- `frontend/app/dashboard/page.tsx` - Protected dashboard

---

## Phase 2: Core Features Implementation (UPCOMING)

### Week 1-2: Table & Reservation Management

#### Task 3.1: Table Management
**Files**:
- `backend/src/controllers/tableController.ts`
- `backend/src/services/tableService.ts`
- `backend/src/routes/table.ts`

**Features**:
- Create table
- Update table status
- Get available tables
- Get all tables

**API Endpoints**:
```
GET    /api/v1/tables
POST   /api/v1/tables (Admin)
GET    /api/v1/tables/:id
PUT    /api/v1/tables/:id (Admin)
DELETE /api/v1/tables/:id (Admin)
```

#### Task 3.2: Reservation System
**Files**:
- `backend/src/controllers/reservationController.ts`
- `backend/src/services/reservationService.ts`
- `backend/src/algorithms/tableAllocation.ts`
- `backend/src/routes/reservation.ts`

**Features**:
- Create reservation
- Get user reservations
- Cancel reservation
- Table allocation algorithm

**API Endpoints**:
```
GET    /api/v1/reservations
POST   /api/v1/reservations
GET    /api/v1/reservations/:id
PUT    /api/v1/reservations/:id
DELETE /api/v1/reservations/:id
GET    /api/v1/reservations/available-slots
```

#### Task 3.3: Reservation Frontend Components
**Files**:
- `frontend/app/reservations/page.tsx`
- `frontend/components/reservations/ReservationForm.tsx`
- `frontend/components/reservations/AvailabilitySlots.tsx`
- `frontend/hooks/useReservation.ts`
- `frontend/services/reservation.ts`

### Week 3: Waitlist & Priority Queue

#### Task 4.1: Waitlist System
**Files**:
- `backend/src/controllers/waitlistController.ts`
- `backend/src/services/waitlistService.ts`
- `backend/src/algorithms/priorityQueue.ts`
- `backend/src/routes/waitlist.ts`

**Features**:
- Add to waitlist
- Update priority (based on loyalty & timestamp)
- Notify when table available
- Remove from waitlist

**API Endpoints**:
```
GET    /api/v1/waitlist
POST   /api/v1/waitlist
GET    /api/v1/waitlist/:id
PUT    /api/v1/waitlist/:id
DELETE /api/v1/waitlist/:id
GET    /api/v1/waitlist/position/:id
```

#### Task 4.2: Waitlist Frontend
**Files**:
- `frontend/components/waitlist/WaitlistStatus.tsx`
- `frontend/services/waitlist.ts`

### Week 4: Menu & Ordering System

#### Task 5.1: Menu Management (Backend)
**Files**:
- `backend/src/controllers/menuController.ts`
- `backend/src/services/menuService.ts`
- `backend/src/routes/menu.ts`

**Features**:
- Get menu items
- Filter by category
- Search menu
- Add/Update/Delete items (Admin)

#### Task 5.2: Order Management (Backend)
**Files**:
- `backend/src/controllers/orderController.ts`
- `backend/src/services/orderService.ts`
- `backend/src/routes/order.ts`

**Features**:
- Create order
- Update order status
- Get order history
- Calculate total with tax/service charge

#### Task 5.3: Order Frontend Components
**Files**:
- `frontend/app/menu/page.tsx`
- `frontend/app/orders/page.tsx`
- `frontend/components/menu/MenuCard.tsx`
- `frontend/components/menu/MenuFilter.tsx`
- `frontend/components/orders/OrderTracker.tsx`
- `frontend/services/menu.ts`
- `frontend/services/order.ts`

---

## Phase 3: Real-Time Features

### Week 5: WebSocket Integration

#### Task 6.1: Socket.io Setup
**Files**:
- `backend/src/socket/events/reservationEvents.ts`
- `backend/src/socket/events/orderEvents.ts`
- `backend/src/socket/events/tableEvents.ts`
- `backend/src/socket/handlers.ts`

**Real-time Events**:
- Order status updates
- Table availability notifications
- Waitlist position changes
- Table heatmap updates

#### Task 6.2: Frontend Socket Integration
**Files**:
- `frontend/lib/socket.ts`
- `frontend/hooks/useSocket.ts`
- `frontend/components/realtime/OrderUpdates.tsx`

---

## Phase 4: Advanced Features

### Week 6: Mood-Based Dining & Sustainability Scoring

#### Task 6.1: Mood-Based Dining Recommendation System
**Files**:
- `backend/src/algorithms/moodBasedRecommendation.ts`
- `backend/src/controllers/moodController.ts`
- `backend/src/services/moodService.ts`
- `backend/src/routes/mood.ts`

**Features**:
- Define mood categories (Romantic, Family, Business Meeting, Birthday)
- Recommend dishes based on mood
- Recommend seating areas/table locations
- Suggest lighting preferences

**Database Updates**:
```prisma
model Mood {
  id        String   @id @default(cuid())
  name      String   @unique // Romantic, Family, Business Meeting, Birthday
  description String?
  icon      String?
  color     String?
  createdAt DateTime @default(now())
}

model MoodPreference {
  id        String   @id @default(cuid())
  userId    String   @unique
  currentMood String?
  preferredTableType String? // Window, Corner, Center, Private
  lightingPreference String? // Dim, Moderate, Bright
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Update MenuItem to support mood associations
model MenuItem {
  // ... existing fields ...
  moods      String[] @default([]) // Associated moods
  tags       String[] @default([]) // Romantic, Celebration, Healthy, etc.
}
```

**API Endpoints**:
```
GET    /api/v1/moods                      // Get all moods
POST   /api/v1/moods/:id/preferences      // Set mood preference
GET    /api/v1/moods/:id/recommendations  // Get recommendations for mood
GET    /api/v1/moods/:id/menu             // Get menu items for mood
GET    /api/v1/moods/:id/tables           // Get suitable tables for mood
```

**Recommendation Algorithm**:
```typescript
interface MoodRecommendation {
  mood: string;
  recommendedDishes: MenuItem[];
  suggestedTableTypes: string[];
  lightingPreference: string;
  ambiance: string;
  musicGenre: string;
}

// Based on:
// 1. Mood category
// 2. Cuisine preferences
// 3. Dietary restrictions
// 4. Past orders
// 5. Available tables/ambiance
```

#### Task 6.2: Sustainability Scoring System
**Files**:
- `backend/src/algorithms/sustainabilityScore.ts`
- `backend/src/controllers/sustainabilityController.ts`
- `backend/src/services/sustainabilityService.ts`
- `backend/src/routes/sustainability.ts`

**Features**:
- Calculate carbon footprint for each dish
- Vegetarian/Vegan score
- Local ingredient badge
- Seasonal availability indicator
- Sustainability dashboard for admins

**Database Updates**:
```prisma
model SustainabilityMetrics {
  id        String   @id @default(cuid())
  menuItemId String   @unique
  carbonFootprint Float    // kg CO2
  waterUsage Float?       // liters
  transportDistance Int?   // km
  isLocalIngredient Boolean @default(false)
  isOrganic Boolean @default(false)
  isVegan Boolean @default(false)
  isVegetarian Boolean @default(false)
  isSeasonal Boolean @default(false)
  packagingType String?    // Recyclable, Compostable, etc.
  sustainabilityScore Int   // 0-100 score
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  menuItem MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
}

model IngredientSource {
  id        String   @id @default(cuid())
  name      String
  origin    String
  distance  Int       // km from restaurant
  isLocalSource Boolean
  carbonFootprint Float
  isOrganic Boolean @default(false)
  isFairTrade Boolean @default(false)
  createdAt DateTime @default(now())
}
```

**API Endpoints**:
```
GET    /api/v1/sustainability/score/:menuItemId
GET    /api/v1/sustainability/dishes                // Get all dishes with scores
GET    /api/v1/sustainability/summary               // Overall sustainability metrics
GET    /api/v1/sustainability/ingredients/:id       // Ingredient details
GET    /api/v1/sustainability/dashboard             // Admin dashboard data
POST   /api/v1/sustainability/metrics               // Add metrics (Admin)
PUT    /api/v1/sustainability/metrics/:id           // Update metrics (Admin)
```

**Sustainability Score Calculation**:
```typescript
interface SustainabilityScore {
  overallScore: number;      // 0-100
  carbonFootprint: number;   // kg CO2
  vegetarianIndex: number;   // 0-100
  localIngredientRatio: number; // %
  sustainabilityBadges: Badge[];
}

// Badges:
// - 🌱 Vegan
// - 🥬 Vegetarian
// - 🌍 Local Ingredients
// - ♻️ Eco-Friendly Packaging
// - 🏘️ Carbon Neutral
// - 🌾 Organic
// - 🤝 Fair Trade
```

**Frontend Components**:
```typescript
// Mood-Based Features
- frontend/components/mood/MoodSelector.tsx
- frontend/components/mood/MoodRecommendations.tsx
- frontend/components/mood/TableSuggestions.tsx
- frontend/hooks/useMoodRecommendation.ts
- frontend/services/mood.ts

// Sustainability Features
- frontend/components/sustainability/SustainabilityBadge.tsx
- frontend/components/sustainability/DishSustainabilityScore.tsx
- frontend/components/sustainability/SustainabilityFilter.tsx
- frontend/components/sustainability/SustainabilityDashboard.tsx
- frontend/hooks/useSustainability.ts
- frontend/services/sustainability.ts
```

**Menu Item Display with Mood & Sustainability**:
```typescript
interface MenuItemDisplay {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  
  // Mood data
  moodTags: string[];           // Romantic, Birthday, Celebration
  suitableFor: string[];         // "Romantic Dinner", "Family Meal"
  
  // Sustainability data
  carbonFootprint: number;
  vegetarianIndex: number;
  localIngredientRatio: number;
  sustainabilityBadges: Badge[];
  sustainabilityScore: number;
  
  // Other existing fields...
}
```

---

### Week 7: Analytics & AI Recommendations

#### Task 7.1: Analytics Dashboard
**Files**:
- `backend/src/controllers/analyticsController.ts`
- `backend/src/services/analyticsService.ts`
- `backend/src/routes/analytics.ts`

**Metrics**:
- Daily revenue
- Monthly revenue
- Top dishes
- Cancellation rate
- Average order value

#### Task 7.2: Peak-Hour Prediction Algorithm
**Files**:
- `backend/src/algorithms/peakHourPrediction.ts`
- `backend/src/services/peakHourService.ts`

#### Task 7.3: Recommendation Engine
**Files**:
- `backend/src/algorithms/recommendationEngine.ts`
- `backend/src/services/recommendationService.ts`

#### Task 7.4: Dynamic Pricing
**Files**:
- `backend/src/algorithms/dynamicPricing.ts`
- `backend/src/services/pricingService.ts`

### Week 8: Admin Dashboard

**Files**:
- `frontend/app/admin/page.tsx`
- `frontend/app/admin/analytics/page.tsx`
- `frontend/app/admin/orders/page.tsx`
- `frontend/app/admin/tables/page.tsx`
- `frontend/components/admin/AnalyticsDashboard.tsx`
- `frontend/components/admin/TableHeatmap.tsx`
- `frontend/hooks/useAdmin.ts`

---

## Phase 5: Testing & Deployment

### Week 9: Testing

#### Task 8.1: Backend Unit Tests
```bash
npm run test
```

#### Task 8.2: Frontend Unit Tests
```bash
npm run test
```

#### Task 8.3: Integration Tests
- Test API endpoints
- Test Socket.io connections
- Test database operations

### Week 10: Deployment

#### Task 9.1: Frontend Deployment (Vercel)
```bash
npm install -g vercel
vercel login
vercel
```

#### Task 9.2: Backend Deployment (Railway)
- Connect GitHub repository
- Set environment variables
- Deploy on Railway

#### Task 9.3: Database Deployment
- Setup production PostgreSQL
- Setup production Redis
- Run migrations

---

## Development Best Practices

### Code Organization

```
src/
├── controllers/     # Request handlers
├── services/       # Business logic
├── routes/         # Route definitions
├── middleware/     # Custom middleware
├── models/         # Data models/types
├── utils/          # Helper functions
├── algorithms/     # Algorithm implementations
├── config/         # Configuration
└── types/          # TypeScript types
```

### Naming Conventions

- Controllers: `entityController.ts`
- Services: `entityService.ts`
- Routes: `entity.ts`
- Middleware: `entityMiddleware.ts`
- Functions: camelCase
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: implement feature"

# Push to repository
git push origin feature/feature-name

# Create Pull Request on GitHub
```

### Testing Strategy

- **Unit Tests**: Test individual functions
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Test user workflows
- **Performance Tests**: Load testing

---

## Key Implementation Notes

### Database Queries
- Always use Prisma for database operations
- Use relations for efficient data fetching
- Implement proper indexing

### API Development
- Follow RESTful conventions
- Always return consistent response format
- Use proper HTTP status codes
- Document endpoints with comments

### Frontend Development
- Use React hooks for state management
- Keep components modular and reusable
- Handle loading and error states
- Use TypeScript for type safety

### Real-Time Communication
- Use Socket.io namespaces for different features
- Implement proper event naming conventions
- Handle connection/disconnection gracefully
- Add error handling for events

---

## Success Criteria

Each task should meet these criteria before moving to the next:

✅ Code is written
✅ Code is tested (unit tests)
✅ Code is documented
✅ Code follows conventions
✅ Code has error handling
✅ Code is reviewed

---

## Timeline & Milestones

- **Week 1**: Phase 1 (Authentication) - Jan 2025
- **Weeks 2-4**: Phase 2 (Core Features) - Feb 2025
- **Week 5**: Phase 3 (Real-time) - Feb 2025
- **Weeks 6-8**: Phase 4 (Advanced) - Mar 2025
- **Weeks 9-10**: Phase 5 (Testing & Deployment) - Mar 2025

**Target Launch**: End of March 2025

---

## Resources & Documentation

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Guide](https://socket.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Last Updated: February 2025
