# Smart Dining System - API Testing Guide

## Quick Start

### 1. Prerequisites
- Node.js v18+ installed
- PostgreSQL running
- Redis running
- Postman or similar API testing tool

### 2. Install & Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment (copy from template)
cp .env.example .env

# Update .env with your PostgreSQL credentials:
# DATABASE_URL=postgresql://user:password@localhost:5432/smart_dining
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-secret-key

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

Server should be running on `http://localhost:5000`

---

## 🧪 API Testing Scenarios

### Scenario 1: User Authentication Flow

#### Step 1: Register a New User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "phone": "+12025551234"
  }'
```

**Expected Response (201):**
```json
{
  "status": "OK",
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clh1234567890abcd",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "CUSTOMER"
    }
  },
  "timestamp": "2025-02-13T10:30:00Z"
}
```

**Save the token for next requests!**

#### Step 2: Login with Credentials
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  },
  "timestamp": "2025-02-13T10:31:00Z"
}
```

#### Step 3: Get Current User Profile
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "clh1234567890abcd",
      "email": "john@example.com",
      "name": "John Doe",
      "phone": "+12025551234",
      "role": "CUSTOMER",
      "preferences": null,
      "loyaltyPoints": {
        "id": "loyalty1",
        "userId": "clh1234567890abcd",
        "points": 0,
        "tier": "SILVER"
      },
      "moodPreference": null
    }
  }
}
```

#### Step 4: Update Profile
```bash
curl -X PUT http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "phone": "+12025559999"
  }'
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "clh1234567890abcd",
      "email": "john@example.com",
      "name": "John Smith",
      "phone": "+12025559999",
      "role": "CUSTOMER"
    }
  }
}
```

#### Step 5: Logout
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Logged out successfully",
  "timestamp": "2025-02-13T10:35:00Z"
}
```

---

### Scenario 2: Mood-Based Dining Recommendations

#### Step 1: Get All Available Moods
```bash
curl -X GET http://localhost:5000/api/v1/moods
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Moods retrieved successfully",
  "data": [
    {
      "id": "romantic",
      "name": "ROMANTIC",
      "characteristics": ["intimate", "cozy", "elegant", "quiet"],
      "suggestedTableType": "Window or Corner",
      "lighting": "Dim",
      "musicGenre": "Jazz/Classical",
      "dishPreferences": ["seafood", "pasta", "wine-paired", "desserts"]
    },
    {
      "id": "family",
      "name": "FAMILY",
      "characteristics": ["fun", "casual", "interactive", "diverse"],
      "suggestedTableType": "Center or Large Table",
      "lighting": "Bright",
      "musicGenre": "Pop/Upbeat",
      "dishPreferences": ["comfort-food", "kid-friendly", "shareable", "variety"]
    },
    {
      "id": "business",
      "name": "BUSINESS",
      ...
    },
    {
      "id": "birthday",
      "name": "BIRTHDAY",
      ...
    }
  ]
}
```

#### Step 2: Get Recommendations for Romantic Mood
```bash
curl -X GET http://localhost:5000/api/v1/moods/romantic/recommendations
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Mood recommendations generated successfully",
  "data": {
    "mood": {
      "id": "romantic",
      "name": "ROMANTIC",
      ...
    },
    "recommendedDishes": [
      {
        "id": "dish1",
        "name": "Pan-Seared Salmon",
        "description": "Fresh salmon with lemon butter sauce",
        "price": 28.99,
        "category": "Seafood",
        "moodTags": ["romantic", "seafood"],
        ...
      },
      ...
    ],
    "suggestedTables": [
      {
        "id": "table1",
        "tableNumber": 5,
        "capacity": 2,
        "location": "Window",
        "tableType": "Window",
        "ambiance": "Romantic",
        "status": "AVAILABLE"
      },
      ...
    ],
    "ambiance": {
      "lighting": "Dim",
      "musicGenre": "Jazz/Classical",
      "tableType": "Window or Corner"
    },
    "estimatedCost": 35.50
  }
}
```

#### Step 3: Set Mood Preference
```bash
curl -X POST http://localhost:5000/api/v1/moods/romantic/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "preferredTableType": "Window",
    "lightingPreference": "Dim",
    "musicPreference": "Jazz"
  }'
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Mood preference set successfully",
  "data": {
    "id": "mood_pref_123",
    "userId": "clh1234567890abcd",
    "currentMood": "romantic",
    "preferredTableType": "Window",
    "lightingPreference": "Dim",
    "musicPreference": "Jazz",
    "updatedAt": "2025-02-13T10:40:00Z"
  }
}
```

#### Step 4: Get Menu Items for Romantic Mood
```bash
curl -X GET "http://localhost:5000/api/v1/moods/romantic/menu?limit=5"
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Menu items for mood retrieved successfully",
  "data": [
    {
      "id": "dish1",
      "name": "Lobster Bisque",
      "price": 16.99,
      "category": "Soup",
      "moodTags": ["romantic"],
      "suitableFor": ["Romantic Dinner"],
      ...
    },
    ...
  ]
}
```

#### Step 5: Get Suitable Tables for Mood
```bash
curl -X GET http://localhost:5000/api/v1/moods/romantic/tables
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Tables for mood retrieved successfully",
  "data": {
    "mood": "ROMANTIC",
    "suggestedTableType": "Window or Corner",
    "tables": [
      {
        "id": "table1",
        "tableNumber": 5,
        "capacity": 2,
        "location": "Window",
        "tableType": "Window",
        "ambiance": "Romantic",
        "status": "AVAILABLE"
      },
      {
        "id": "table2",
        "tableNumber": 8,
        "capacity": 2,
        "location": "Corner",
        "tableType": "Corner",
        "ambiance": "Romantic",
        "status": "AVAILABLE"
      }
    ]
  }
}
```

#### Step 6: Get User's Current Mood Preference
```bash
curl -X GET http://localhost:5000/api/v1/moods/my-preference \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

### Scenario 3: Sustainability Scoring

#### Step 1: Get Sustainability Score for a Dish
```bash
curl -X GET http://localhost:5000/api/v1/sustainability/score/dish123
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Sustainability score retrieved successfully",
  "data": {
    "menuItem": {
      "id": "dish123",
      "name": "Organic Quinoa Bowl"
    },
    "score": {
      "overallScore": 88,
      "carbonScore": 92,
      "vegetarianScore": 100,
      "localScore": 85,
      "organicScore": 95,
      "badges": [
        {
          "icon": "🌱",
          "label": "Vegan",
          "description": "No animal products"
        },
        {
          "icon": "🌍",
          "label": "Local",
          "description": "Locally sourced ingredients"
        },
        {
          "icon": "🍃",
          "label": "Organic",
          "description": "No synthetic pesticides or fertilizers"
        }
      ],
      "recommendation": "🌟 Highly sustainable choice!"
    }
  }
}
```

#### Step 2: Get All Dishes with Sustainability Scores
```bash
curl -X GET "http://localhost:5000/api/v1/sustainability/dishes?limit=10&offset=0"
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Dishes with sustainability scores retrieved successfully",
  "data": [
    {
      "id": "dish1",
      "name": "Vegan Buddha Bowl",
      "price": 14.99,
      "category": "Vegetables",
      "sustainability": { ... },
      "score": {
        "overallScore": 88,
        ...
      }
    },
    {
      "id": "dish2",
      "name": "Grass-Fed Steak",
      "price": 42.99,
      "category": "Beef",
      "sustainability": { ... },
      "score": {
        "overallScore": 35,
        ...
      }
    }
  ]
}
```

#### Step 3: Get Restaurant Sustainability Summary
```bash
curl -X GET http://localhost:5000/api/v1/sustainability/summary
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Restaurant sustainability metrics retrieved successfully",
  "data": {
    "averageSustainabilityScore": 72,
    "totalDishes": 45,
    "veganOptions": 8,
    "vegetarianOptions": 12,
    "localSourcedDishes": 28,
    "organicDishes": 18,
    "totalCarbonFootprint": "245.60 kg CO2",
    "recommendationLevel": "✅ Good sustainable option"
  }
}
```

#### Step 4: Filter Dishes by Sustainability Score (Minimum 70)
```bash
curl -X GET "http://localhost:5000/api/v1/sustainability/filter?minScore=70"
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Dishes filtered by sustainability score (70+)",
  "data": {
    "minScore": 70,
    "total": 45,
    "filtered": 28,
    "items": [ ... ]
  }
}
```

#### Step 5: Add Sustainability Metrics (Admin Only)
```bash
curl -X POST http://localhost:5000/api/v1/sustainability/metrics \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "menuItemId": "dish_new_1",
    "carbonFootprint": 1.5,
    "waterUsage": 45,
    "transportDistance": 25,
    "isLocalIngredient": true,
    "isOrganic": true,
    "isVegan": false,
    "isVegetarian": true,
    "isSeasonal": true,
    "packagingType": "Recyclable"
  }'
```

**Expected Response (201):**
```json
{
  "status": "OK",
  "message": "Sustainability metrics added successfully",
  "data": {
    "metrics": {
      "id": "sustain_123",
      "menuItemId": "dish_new_1",
      "carbonFootprint": 1.5,
      "sustainabilityScore": 82,
      "badges": ["Vegetarian", "Local", "Organic", "Seasonal"]
    },
    "score": {
      "overallScore": 82,
      ...
    }
  }
}
```

#### Step 6: Update Sustainability Metrics (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/v1/sustainability/metrics/sustain_123 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "carbonFootprint": 1.2,
    "isOrganic": true
  }'
```

---

## 🔌 WebSocket Testing

### Using Node.js/JavaScript

```javascript
const io = require('socket.io-client');

// Connect to server
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');

  // Emit mood selection
  socket.emit('mood:selected', 'romantic');

  // Listen for updates
  socket.on('mood:updated', (data) => {
    console.log('Mood updated:', data);
  });

  // Emit order
  socket.emit('order:placed', {
    userId: 'user123',
    items: [{ dishId: 'dish1', quantity: 2 }],
    totalPrice: 45.99
  });

  // Listen for new orders (kitchen/admin only)
  socket.on('order:broadcast', (orderData) => {
    console.log('New order:', orderData);
  });

  // Update table status
  socket.emit('table:status', {
    tableId: 'table1',
    status: 'OCCUPIED'
  });

  socket.on('table:updated', (tableStatus) => {
    console.log('Table status:', tableStatus);
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

---

## ❌ Common Errors & Solutions

### 401 Unauthorized
```json
{
  "status": "ERROR",
  "message": "Invalid or expired token"
}
```
**Solution:** Make sure token is valid and not expired. Re-login if needed.

### 403 Forbidden
```json
{
  "status": "ERROR",
  "message": "Access denied. Admin only"
}
```
**Solution:** Admin endpoint requires admin role. Check user role in token.

### 404 Not Found
```json
{
  "status": "ERROR",
  "message": "Menu item not found"
}
```
**Solution:** Check if the ID exists in database.

### 400 Validation Error
```json
{
  "status": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email"
    }
  ]
}
```
**Solution:** Fix validation errors in request body.

---

## 📝 Postman Collection

Import this environment variables in Postman:

```json
{
  "baseUrl": "http://localhost:5000/api/v1",
  "token": "your_jwt_token_here",
  "userId": "your_user_id_here"
}
```

Use the following in request URL:
```
{{baseUrl}}/auth/login
Authorization: Bearer {{token}}
```

---

## 🗂️ Test Data

You can pre-populate database with test data. Create `backend/prisma/seed.ts`:

```typescript
import { prisma } from '../src/config/database';

async function main() {
  // Create moods
  await prisma.mood.createMany({
    data: [
      { name: 'ROMANTIC', id: 'romantic', icon: '💕', color: '#FF69B4' },
      { name: 'FAMILY', id: 'family', icon: '👨‍👩‍👧‍👦', color: '#4169E1' },
      { name: 'BUSINESS', id: 'business', icon: '💼', color: '#696969' },
      { name: 'BIRTHDAY', id: 'birthday', icon: '🎉', color: '#FFD700' }
    ]
  });

  console.log('Seeding completed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Run: `npx prisma db seed`

---

## ✅ Success Checklist

- [ ] Backend running on localhost:5000
- [ ] PostgreSQL connected
- [ ] Redis running
- [ ] User registration working
- [ ] JWT token generation working
- [ ] Mood endpoints returning data
- [ ] Sustainability scoring working
- [ ] WebSocket connection established
- [ ] All endpoints return consistent response format

---

Last Updated: February 2025
