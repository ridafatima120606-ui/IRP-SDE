import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

// Import routes
import authRoutes from './routes/auth';
import moodRoutes from './routes/mood';
import sustainabilityRoutes from './routes/sustainability';
import menuRoutes from './routes/menu';
import tableRoutes from './routes/table';
import reservationRoutes from './routes/reservation';
import orderRoutes from './routes/order';
import paymentRoutes from './routes/payment';
import analyticsRoutes from './routes/analytics';
import waitlistRoutes from './routes/waitlist';
import pricingRoutes from './routes/pricing';
import loyaltyRoutes from './routes/loyalty';
import notificationRoutes from './routes/notification';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const port = process.env.PORT || 5000;

// Root route handler
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Smart Dining System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/v1/auth',
      menu: '/api/v1/menu',
      reservations: '/api/v1/reservations',
      orders: '/api/v1/orders',
      payments: '/api/v1/payments',
      waitlist: '/api/v1/waitlist',
      pricing: '/api/v1/pricing',
      loyalty: '/api/v1/loyalty',
      notifications: '/api/v1/notifications',
      analytics: '/api/v1/analytics',
    }
  });
});

// Create HTTP server for Socket.io
const server = http.createServer(app);
// Allow frontend running on 3000 and 3001 during development
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  'http://localhost:3001',
];
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({ origin: (origin, callback) => {
  // allow requests with no origin (like curl/postman)
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Not allowed by CORS'), false);
}}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import database utilities
import { isUsingMockDatabase } from './config/database';

// Health check endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  const mockDb = isUsingMockDatabase();
  res.status(200).json({
    status: 'OK',
    message: 'Smart Dining System Backend is running',
    database: mockDb ? 'Mock Database (Development)' : 'PostgreSQL',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/moods', moodRoutes);
app.use('/api/v1/sustainability', sustainabilityRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/waitlist', waitlistRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Mood-related events
  socket.on('mood:selected', (moodId) => {
    console.log(`User selected mood: ${moodId}`);
    io.emit('mood:updated', { userId: socket.id, mood: moodId });
  });

  // Order-related events
  socket.on('order:placed', (orderData) => {
    console.log('Order placed:', orderData);
    io.emit('order:broadcast', orderData);
  });

  socket.on('order:status', (status) => {
    console.log('Order status updated:', status);
    io.emit('order:statusUpdate', status);
  });

  // Table-related events
  socket.on('table:status', (tableStatus) => {
    console.log('Table status changed:', tableStatus);
    io.emit('table:updated', tableStatus);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

// Start server
server.listen(port, () => {
  const dbMode = isUsingMockDatabase() ? '🗂️  Mock Database' : '🐘 PostgreSQL';
  console.log(`\n✅ Smart Dining System Backend is RUNNING!`);
  console.log(`🚀 Server: http://localhost:${port}`);
  console.log(`📡 API: http://localhost:${port}/api/v1`);
  console.log(`🔌 WebSocket: ws://localhost:${port}`);
  console.log(`💾 Database: ${dbMode}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n✨ Ready to accept requests!\n`);
});

// Export app, io and server
export { app, io, server };
