# Smart Dining System - Quick Start Guide

## Prerequisites & Setup

### 1. Install Required Software

#### Node.js & npm
- Download from: https://nodejs.org/
- Recommended: LTS version (v18+)
- Verify: `node --version` and `npm --version`

#### PostgreSQL
- Download from: https://www.postgresql.org/download/
- Create database: `createdb smart_dining`
- Verify: `psql --version`

#### Redis (Optional but Recommended)
- Download from: https://redis.io/download
- Start Redis: `redis-server`
- Or use Docker: `docker run -d -p 6379:6379 redis`

#### Git (for version control)
- Download from: https://git-scm.com/

---

## Project Setup

### Step 1: Clone/Navigate to Project
```bash
cd C:\Users\naimu\Desktop\IRP-SDE
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

Create `.env` file in `backend/` directory:
```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_dining"
REDIS_URL="redis://localhost:6379"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET="your-secret-key-min-32-chars-long"
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
```

### Step 4: Setup Database & Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Optional: Seed with sample data
npx prisma db seed
```

### Step 5: Start Backend Server

```bash
npm run dev
```

Expected output:
```
🚀 Smart Dining System Backend running on port 5000
Environment: development
API URL: http://localhost:5000/api/v1
WebSocket: ws://localhost:5000
```

### Step 6: Install Frontend Dependencies (Optional)

```bash
cd ../frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

## Testing the API

### Option 1: Using cURL (Command Line)

#### 1. User Registration
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass@123",
    "name": "Test User",
    "phone": "+12025551234"
  }'
```

**Save the JWT token from response!**

#### 2. Create Menu Items (Admin)
First, register as admin or change user role in database:
```bash
npm run seed:admin
```

Then create menu:
```bash
curl -X POST http://localhost:5000/api/v1/menu \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pan-Seared Salmon",
    "price": 28.99,
    "category": "Seafood",
    "description": "Fresh salmon with lemon butter sauce",
    "moodTags": ["romantic", "seafood"],
    "prepTime": 20,
    "available": true
  }'
```

#### 3. Create Tables (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/tables \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": 1,
    "capacity": 2,
    "location": "Window",
    "tableType": "Window",
    "ambiance": "Romantic"
  }'
```

#### 4. Get Mood Recommendations
```bash
curl -X GET http://localhost:5000/api/v1/moods/romantic/recommendations
```

#### 5. Make a Reservation
```bash
curl -X POST http://localhost:5000/api/v1/reservations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "guestCount": 2,
    "reservationDate": "2025-02-20T19:00:00Z",
    "durationMinutes": 120,
    "specialRequests": "Window table preferred"
  }'
```

#### 6. Place an Order
```bash
# First, get menu items to get their IDs
curl -X GET http://localhost:5000/api/v1/menu

# Create order with menu item IDs
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"menuItemId": "MENU_ITEM_ID_HERE", "quantity": 2}
    ],
    "tableId": "TABLE_ID_HERE",
    "notes": "No onions please"
  }'
```

---

### Option 2: Using Postman

1. **Open Postman**
2. **Create new collection** → Name: "Smart Dining API"
3. **Add environment variables**:
   - `base_url`: `http://localhost:5000/api/v1`
   - `jwt_token`: (leave empty, will fill after login)

4. **Create requests** in this order:

#### Request 1: Register User
```
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPass@123",
  "name": "Test User",
  "phone": "+12025551234"
}
```
- Save token to environment: Tests tab →
  ```javascript
  var jsonData = pm.response.json();
  pm.environment.set("jwt_token", jsonData.data.token);
  ```

#### Request 2: Get Current User
```
GET {{base_url}}/auth/me
Authorization: Bearer {{jwt_token}}
```

#### Request 3: Get All Moods
```
GET {{base_url}}/moods
```

#### Request 4: Get Mood Recommendations
```
GET {{base_url}}/moods/romantic/recommendations
```

#### Request 5: Create Tables (Need admin token)
```
POST {{base_url}}/tables
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "tableNumber": 1,
  "capacity": 2,
  "location": "Window",
  "tableType": "Window",
  "ambiance": "Romantic"
}
```

#### Request 6: Get Available Time Slots
```
GET {{base_url}}/reservations/slots/available?date=2025-02-20&capacity=2
```

#### Request 7: Create Reservation
```
POST {{base_url}}/reservations
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "guestCount": 2,
  "reservationDate": "2025-02-20T19:00:00Z",
  "durationMinutes": 120,
  "specialRequests": "Window table preferred"
}
```

#### Request 8: Get Menu Items
```
GET {{base_url}}/menu?limit=10&category=Seafood
```

#### Request 9: Place Order
```
POST {{base_url}}/orders
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "items": [
    {
      "menuItemId": "[GET_FROM_REQUEST_8]",
      "quantity": 2,
      "specialInstructions": "No onions"
    }
  ],
  "notes": "Please deliver hot"
}
```

#### Request 10: Get Order Status
```
GET {{base_url}}/orders/[ORDER_ID_FROM_REQUEST_9]
Authorization: Bearer {{jwt_token}}
```

---

### Option 3: Using VS Code REST Client Extension

Install extension: `REST Client` by Huachao Mao

Create file: `test.rest`

```rest
@base = http://localhost:5000/api/v1
@token = your-jwt-token-here

### 1. Register
POST {{base}}/auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPass@123",
  "name": "Test User"
}

### 2. Login
POST {{base}}/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPass@123"
}

### 3. Get Current User
GET {{base}}/auth/me
Authorization: Bearer {{token}}

### 4. Get Moods
GET {{base}}/moods

### 5. Get Mood Recommendations
GET {{base}}/moods/romantic/recommendations

### 6. Create Menu Item (Admin only)
POST {{base}}/menu
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Ribeye Steak",
  "price": 45.99,
  "category": "Beef",
  "description": "Premium cut, cooked to perfection"
}

### 7. Get All Menu Items
GET {{base}}/menu

### 8. Create Table
POST {{base}}/tables
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "tableNumber": 1,
  "capacity": 2,
  "location": "Window"
}

### 9. Make Reservation
POST {{base}}/reservations
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "guestCount": 2,
  "reservationDate": "2025-02-20T19:00:00Z"
}

### 10. Place Order
POST {{base}}/orders
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "items": [
    {"menuItemId": "dish-id-here", "quantity": 2}
  ]
}
```

Click "Send Request" above each request!

---

## Database Seeding

Create initial data automatically:

```bash
# Create seed file
cat > backend/prisma/seed.ts << 'EOF'
import { prisma } from '../src/config/database';

async function main() {
  // Create default moods
  await prisma.mood.createMany({
    data: [
      { name: 'ROMANTIC', id: 'romantic' },
      { name: 'FAMILY', id: 'family' },
      { name: 'BUSINESS', id: 'business' },
      { name: 'BIRTHDAY', id: 'birthday' }
    ],
    skipDuplicates: true
  });

  // Create sample menu items
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Grilled Salmon',
        price: 28.99,
        category: 'SEAFOOD',
        moodTags: ['romantic']
      },
      {
        name: 'Burger', 
        price: 14.99,
        category: 'BEEF',
        moodTags: ['family']
      },
      {
        name: 'Pasta Carbonara',
        price: 16.99,
        category: 'PASTA',
        moodTags: ['romantic']
      }
    ],
    skipDuplicates: true
  });

  // Create sample tables
  await prisma.table.createMany({
    data: [
      { tableNumber: 1, capacity: 2, location: 'Window', status: 'AVAILABLE' },
      { tableNumber: 2, capacity: 4, location: 'Center', status: 'AVAILABLE' },
      { tableNumber: 3, capacity: 6, location: 'Corner', status: 'AVAILABLE' }
    ],
    skipDuplicates: true
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
EOF

# Run seed
npx prisma db seed
```

---

## Troubleshooting

### Issue: PostgreSQL Connection Failed
**Solution**:
```bash
# Check PostgreSQL is running
psql --version

# Create database if not exists
createdb smart_dining

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/smart_dining"
```

### Issue: Port 5000 Already in Use
**Solution**:
```bash
# Change port in .env
PORT=5001

# Or kill process using port:
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000 | kill -9 <PID>
```

### Issue: JWT Token Expired
**Solution**:
- Re-login to get new token
- Or increase JWT_EXPIRY in .env

### Issue: Module Not Found
**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Regenerate Prisma
npx prisma generate
```

### Issue: Database Migrations Failed
**Solution**:
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or manually:
# 1. Drop database: dropdb smart_dining
# 2. Create database: createdb smart_dining  
# 3. Run migrations: npx prisma migrate dev --name init
```

---

## API Rate Limits & Best Practices

### Recommended Usage Patterns
1. **Authentication**: Token per session, not per request
2. **Pagination**: Use limit/offset for list endpoints
3. **Filtering**: Use query parameters for filtering
4. **Caching**: Cache mode recommendations (1-hour TTL)
5. **Batch**: Don't create items one-by-one

### Performance Tips
- Use pagination (limit: 20-50)
- Filter before requesting data
- Cache API responses in frontend
- Use gzip compression
- Monitor database query times

---

## Monitoring & Logs

### Enable Debug Logging
```bash
# In .env
DEBUG=*

# Or specific:
DEBUG=auth:*,order:*
```

### View Server Logs
```bash
# The development server will show:
# - HTTP requests (method, path, status)
# - WebSocket connections/disconnections
# - Database query times
# - Error details
```

### Database Logs
```bash
# Enable Prisma query logging
npx prisma studio

# Access at: http://localhost:5555
```

---

## Next Steps

After setup works:

1. **Create Admin User**
   - Manually set role to ADMIN in database
   - Or implement admin registration endpoint

2. **Add More Menu Items**
   - Create 20+ dishes with mood tags
   - Add photos and descriptions

3. **Setup Sustainability Metrics**
   - Add carbon scores for each dish
   - Tag vegan/vegetarian items

4. **Integration Testing**
   - Test complete reservation flow
   - Test order flow end-to-end
   - Test mood recommendations

5. **Frontend Development**
   - Create login page
   - Create menu browsing page
   - Create reservation booking page
   - Create order tracking page

---

## Deployment Checklist

- [ ] Database backed up
- [ ] Environment variables set for production
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] CORS_ORIGIN set to frontend domain
- [ ] Database migrations run
- [ ] Docker built and tested
- [ ] Health check endpoint verified
- [ ] Error handling tested
- [ ] Load testing completed
- [ ] Security review done

---

## Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs/
- **Express.js**: https://expressjs.com/
- **Socket.io**: https://socket.io/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **JWT**: https://jwt.io/introduction
- **REST API Best Practices**: https://restfulapi.net/

---

**Quick Links**:
- 📚 Full Documentation: See `BACKEND_IMPLEMENTATION_SUMMARY.md`
- 🧪 Test Scenarios: See `API_TESTING_GUIDE.md`
- 📖 Feature Details: See `MOOD_SUSTAINABILITY_FEATURES.md`
- 🛣️ Roadmap: See `DEVELOPMENT_ROADMAP.md`

---

**Last Updated**: February 2025
**Version**: 1.0
