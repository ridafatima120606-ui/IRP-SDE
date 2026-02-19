# Backend Implementation Guide

## Overview

This guide covers the Backend API implementation for the Smart Dining System, including:
- Authentication (JWT-based)
- Mood-Based Dining Recommendations
- Sustainability Scoring System
- Real-Time WebSocket Events

---

## 🔐 Authentication System

### Database Setup

The User model includes:
- Email and password (hashed with bcrypt)
- Role-based access (CUSTOMER, ADMIN, CHEF)
- Relations to preferences, loyalty points, and mood preferences

### Endpoints

#### Register a New User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890"
}

# Response (201)
{
  "status": "OK",
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CUSTOMER"
    }
  }
}
```

#### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

# Response (200)
{
  "status": "OK",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

#### Get Current User
```bash
GET /api/v1/auth/me
Authorization: Bearer <JWT_TOKEN>

# Response (200)
{
  "status": "OK",
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "role": "CUSTOMER",
      "preferences": { ... },
      "loyaltyPoints": { ... },
      "moodPreference": { ... }
    }
  }
}
```

#### Update Profile
```bash
PUT /api/v1/auth/profile
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+0987654321"
}

# Response (200)
{
  "status": "OK",
  "message": "Profile updated successfully",
  "data": { ... }
}
```

#### Logout
```bash
POST /api/v1/auth/logout
Authorization: Bearer <JWT_TOKEN>

# Response (200)
{
  "status": "OK",
  "message": "Logged out successfully"
}
```

---

## 🎭 Mood-Based Dining API

### Endpoints

#### Get All Moods
```bash
GET /api/v1/moods

# Response (200)
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
    ...
  ]
}
```

#### Get Recommendations for a Mood
```bash
GET /api/v1/moods/romantic/recommendations

# Response (200)
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
        "id": "dish123",
        "name": "Pan-Seared Salmon",
        "price": 28.99,
        "moodScore": 95,
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
        ...
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

#### Set User Mood Preference
```bash
POST /api/v1/moods/romantic/preferences
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "preferredTableType": "Window",
  "lightingPreference": "Dim",
  "musicPreference": "Jazz"
}

# Response (200)
{
  "status": "OK",
  "message": "Mood preference set successfully",
  "data": {
    "id": "pref123",
    "userId": "user123",
    "currentMood": "romantic",
    "preferredTableType": "Window",
    "lightingPreference": "Dim",
    "musicPreference": "Jazz",
    "updatedAt": "2025-02-13T10:00:00Z"
  }
}
```

#### Get Menu Items for Mood
```bash
GET /api/v1/moods/romantic/menu?limit=10

# Response (200)
{
  "status": "OK",
  "message": "Menu items for mood retrieved successfully",
  "data": [
    {
      "id": "dish1",
      "name": "Seafood Pasta",
      "price": 24.99,
      "moodTags": ["romantic", "seafood"],
      "suitableFor": ["Romantic Dinner", "Date Night"],
      ...
    },
    ...
  ]
}
```

#### Get Tables for Mood
```bash
GET /api/v1/moods/romantic/tables

# Response (200)
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
        "tableType": "Window",
        "ambiance": "Romantic",
        "status": "AVAILABLE"
      },
      ...
    ]
  }
}
```

#### Get User's Current Mood Preference
```bash
GET /api/v1/moods/my-preference
Authorization: Bearer <JWT_TOKEN>

# Response (200)
{
  "status": "OK",
  "message": "User mood preference retrieved successfully",
  "data": {
    "id": "pref123",
    "userId": "user123",
    "currentMood": "romantic",
    ...
  }
}
```

---

## 🌱 Sustainability Scoring API

### Endpoints

#### Get Sustainability Score for Menu Item
```bash
GET /api/v1/sustainability/score/dish123

# Response (200)
{
  "status": "OK",
  "message": "Sustainability score retrieved successfully",
  "data": {
    "menuItem": {
      "id": "dish123",
      "name": "Vegan Buddha Bowl"
    },
    "score": {
      "overallScore": 88,
      "carbonScore": 95,
      "vegetarianScore": 100,
      "localScore": 80,
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
        ...
      ],
      "recommendation": "🌟 Highly sustainable choice!"
    }
  }
}
```

#### Get All Dishes with Sustainability Scores
```bash
GET /api/v1/sustainability/dishes?limit=50&offset=0

# Response (200)
{
  "status": "OK",
  "message": "Dishes with sustainability scores retrieved successfully",
  "data": [
    {
      "id": "dish1",
      "name": "Organic Salad",
      "price": 12.99,
      "sustainability": { ... },
      "score": {
        "overallScore": 85,
        ...
      }
    },
    ...
  ]
}
```

#### Get Restaurant Sustainability Summary
```bash
GET /api/v1/sustainability/summary

# Response (200)
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

#### Filter Dishes by Sustainability Score
```bash
GET /api/v1/sustainability/filter?minScore=70

# Response (200)
{
  "status": "OK",
  "message": "Dishes filtered by sustainability score (70+)",
  "data": {
    "minScore": 70,
    "total": 45,
    "filtered": 32,
    "items": [ ... ]
  }
}
```

#### Add Sustainability Metrics (Admin Only)
```bash
POST /api/v1/sustainability/metrics
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "menuItemId": "dish123",
  "carbonFootprint": 1.2,
  "waterUsage": 45,
  "transportDistance": 25,
  "isLocalIngredient": true,
  "isOrganic": true,
  "isVegan": false,
  "isVegetarian": true,
  "isSeasonal": true,
  "packagingType": "Recyclable"
}

# Response (201)
{
  "status": "OK",
  "message": "Sustainability metrics added successfully",
  "data": {
    "metrics": { ... },
    "score": { ... }
  }
}
```

#### Update Sustainability Metrics (Admin Only)
```bash
PUT /api/v1/sustainability/metrics/metrics123
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "carbonFootprint": 1.0,
  "isOrganic": true
}

# Response (200)
{
  "status": "OK",
  "message": "Sustainability metrics updated successfully",
  "data": { ... }
}
```

---

## 🔌 WebSocket Events

### Connect
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### Mood Events
```javascript
// User selects a mood
socket.emit('mood:selected', 'romantic');

// Listen for mood updates
socket.on('mood:updated', (data) => {
  console.log('User selected mood:', data.mood);
});
```

### Order Events
```javascript
// Place order
socket.emit('order:placed', {
  userId: 'user123',
  items: [...],
  totalPrice: 45.99
});

// Listen for order broadcasts
socket.on('order:broadcast', (orderData) => {
  console.log('New order:', orderData);
});

// Order status update
socket.emit('order:status', {
  orderId: 'order123',
  status: 'PREPARING'
});

socket.on('order:statusUpdate', (status) => {
  console.log('Order status:', status);
});
```

### Table Events
```javascript
// Table status changed
socket.emit('table:status', {
  tableId: 'table1',
  status: 'OCCUPIED'
});

// Listen for table updates
socket.on('table:updated', (tableStatus) => {
  console.log('Table status:', tableStatus);
});
```

---

## 🔑 Authentication Headers

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are obtained during login and have an expiry (default: 7 days).

---

## 🛡️ Error Handling

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "OK",
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2025-02-13T10:00:00Z"
}
```

### Error Response
```json
{
  "status": "ERROR",
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2025-02-13T10:00:00Z"
}
```

### Validation Error Response
```json
{
  "status": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email"
    }
  ],
  "timestamp": "2025-02-13T10:00:00Z"
}
```

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Get Moods
```bash
curl -X GET http://localhost:5000/api/v1/moods
```

### Get Sustainability Score
```bash
curl -X GET http://localhost:5000/api/v1/sustainability/score/dish123
```

---

## 📊 Database Models

### User
```prisma
model User {
  id        String
  email     String @unique
  password  String
  name      String
  phone     String?
  role      Role
  createdAt DateTime
  updatedAt DateTime
  
  reservations Reservation[]
  orders Order[]
  preferences CustomerPreference?
  moodPreference MoodPreference?
  loyaltyPoints LoyaltyPoints?
  feedback Feedback[]
}
```

### MoodPreference
```prisma
model MoodPreference {
  id                 String
  userId             String @unique
  currentMood        String?
  preferredTableType String?
  lightingPreference String?
  musicPreference    String?
  updatedAt          DateTime
  user               User
}
```

### SustainabilityMetrics
```prisma
model SustainabilityMetrics {
  id                  String
  menuItemId          String @unique
  carbonFootprint     Float
  waterUsage          Float?
  transportDistance   Int?
  isLocalIngredient   Boolean
  isOrganic           Boolean
  isVegan             Boolean
  isVegetarian        Boolean
  isSeasonal          Boolean
  packagingType       String?
  sustainabilityScore Int
  badges              String[]
  createdAt           DateTime
  updatedAt           DateTime
  menuItem            MenuItem
}
```

---

## 🚀 Next Steps

1. **Database Migration**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name initial_setup
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test Endpoints**
   - Use Postman, Insomnia, or Thunder Client
   - Or use the cURL examples above

---

## 📚 Key Features

✅ JWT-based authentication with role-based access
✅ Mood-based dining recommendations
✅ Comprehensive sustainability scoring
✅ Real-time WebSocket events
✅ Input validation with express-validator
✅ Consistent error handling
✅ Async/await with error handling
✅ Environment-based configuration

---

Last Updated: February 2025
