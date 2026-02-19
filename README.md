# Smart Dining System

A full-stack, intelligent restaurant management and customer experience platform designed to modernize traditional dining operations.

## 🎯 Overview

The Smart Dining System integrates smart table reservations, real-time order tracking, AI-based recommendations, peak-hour prediction, dynamic pricing, analytics dashboards, and digital payments into a single scalable solution.

## ✨ Key Features

### Customer Features
- 🔐 Secure authentication with JWT & OAuth (Google)
- 📅 Smart table reservation with real-time availability
- ⏳ Waitlist management with priority queue logic
- 🎭 Mood-based dining experience recommendations
- 🍽️ Personalized menu recommendations
- 📍 Real-time order tracking with WebSocket updates
- 💳 Smart billing with tax calculation and split bills
- 🌱 Sustainability score for eco-conscious dining
- 💰 Dynamic pricing with peak-hour surcharge
- 🎫 QR code table ordering

### Admin Dashboard
- 📊 Real-time restaurant overview
- 🗺️ Table heatmap visualization
- 📈 Peak hour prediction engine
- 📉 Comprehensive analytics dashboard
- 👥 Customer behavior analytics
- ⏱️ Order & kitchen management
- 💡 Loyalty points system

## 🏗️ Tech Stack

### Frontend
- **React** - UI library
- **Next.js** - Server-side rendering & routing
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Component system
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express.js** - API framework
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Database & Cache
- **PostgreSQL** - Primary database
- **Prisma** - ORM
- **Redis** - Caching layer

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Vercel** - Frontend deployment
- **Railway** - Backend deployment

## 📋 Project Structure

```
IRP-SDE/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utility libraries
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   ├── utils/               # Helper functions
│   ├── services/            # API service layer
│   ├── styles/              # Global styles
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── routes/          # API route definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Data models
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Helper functions
│   │   ├── config/          # Configuration files
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
│
├── docker/                  # Docker configuration
│   ├── Dockerfile.frontend  # Frontend Docker image
│   ├── Dockerfile.backend   # Backend Docker image
│   └── docker-compose.yml   # Multi-container setup
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL (v14+)
- Redis
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IRP-SDE
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

4. **Configure Environment Variables**
   
   Frontend (`.env.local`):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```

   Backend (`.env`):
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/smart_dining
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   PORT=5000
   ```

### Running the Application

#### Development Mode

**Option 1: Using npm directly**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Option 2: Using Docker Compose**
```bash
docker-compose -f docker/docker-compose.yml up
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Backend Health: http://localhost:5000/api/v1/health

#### Production Build

Frontend:
```bash
cd frontend
npm run build
npm start
```

Backend:
```bash
cd backend
npm run build
npm start
```

## 📊 Database Schema

The database includes the following core tables:

- **users** - User accounts with roles
- **tables** - Restaurant tables with capacity
- **reservations** - Booking records
- **waitlist** - Queue with priority logic
- **menu_items** - Menu with nutritional info
- **orders** - Customer orders
- **order_items** - Items in each order
- **payments** - Payment tracking
- **feedback** - Customer reviews
- **loyalty_points** - Rewards system
- **peak_hour_statistics** - Demand analytics

See `backend/prisma/schema.prisma` for detailed schema.

## 🔐 Security

- HTTPS encryption
- JWT-based authentication
- bcrypt password hashing
- SQL injection prevention via Prisma ORM
- Role-based access control (RBAC)
- Secure API validation with Zod

## 🤖 Algorithms Implemented

1. **Table Allocation Algorithm** - Optimal table assignment
2. **Priority Queue for Waitlist** - Fair customer queue management
3. **Peak Hour Prediction** - Frequency analysis for demand forecasting
4. **Recommendation Engine** - Personalized dish suggestions
5. **Dynamic Pricing Formula** - Peak-hour surcharge calculation
6. **Delay Compensation Logic** - Automatic discounts for delayed orders

## 📈 Analytics Dashboard

The admin dashboard provides insights on:
- Daily/Monthly revenue
- Top/Bottom performing dishes
- Customer retention rate
- Table utilization percentage
- Cancellation rate
- Average order value
- Customer visit frequency
- Peak visiting times

## 🔄 Real-Time Features

Using Socket.io for live updates:
- Order status changes
- Table availability notifications
- Waitlist status updates
- Kitchen workload broadcasting
- Customer notifications

## 📱 API Endpoints (To Be Implemented)

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Reservations
- `GET /api/v1/reservations` - List reservations
- `POST /api/v1/reservations` - Create reservation
- `GET /api/v1/reservations/:id` - Get reservation
- `PUT /api/v1/reservations/:id` - Update reservation
- `DELETE /api/v1/reservations/:id` - Cancel reservation

### Orders
- `GET /api/v1/orders` - List orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/:id` - Get order
- `PUT /api/v1/orders/:id` - Update order

### Menu
- `GET /api/v1/menu` - List menu items
- `POST /api/v1/menu` - Add menu item (admin)
- `PUT /api/v1/menu/:id` - Update menu item (admin)

### Admin
- `GET /api/v1/admin/analytics` - Analytics data
- `GET /api/v1/admin/tables` - Table status
- `GET /api/v1/admin/orders` - All orders

## 🚦 Future Enhancements

- Mobile application (React Native)
- AI-based demand forecasting (TensorFlow.js)
- Voice ordering integration
- IoT-based smart table sensors
- Multi-branch restaurant support
- Blockchain-based transparent billing
- Advanced recommendation engine

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributors


## 📧 Contact

For issues and questions, please open an issue on GitHub.

---

**Status**: 🚧 Development in Progress

The system is currently in development phase. Core features scaffolding is complete and ready for implementation.
