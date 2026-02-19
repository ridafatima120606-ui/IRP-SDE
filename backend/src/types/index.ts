// User Types
import { Request } from 'express';

export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'CHEF';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// JWT Payload
export interface IJWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Reservation Types
export interface IReservation {
  id: string;
  userId: string;
  tableId?: string;
  reservationDate: Date;
  reservationTime: Date;
  guestCount: number;
  specialRequests?: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  createdAt: Date;
  updatedAt: Date;
}

export interface IReservationRequest {
  tableId?: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  specialRequests?: string;
}

// Table Types
export interface ITable {
  id: string;
  tableNumber: number;
  capacity: number;
  location?: string;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface IOrder {
  id: string;
  userId: string;
  tableId?: string;
  orderStatus: 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  totalPrice: number;
  taxAmount: number;
  serviceCharge: number;
  surcharge: number;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderRequest {
  tableId?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialRequest?: string;
  }>;
  specialInstructions?: string;
}

// MenuItem Types
export interface IMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  prepTime: number;
  calories?: number;
  isVegetarian: boolean;
  isLocalIngredient: boolean;
  carbonFootprint?: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface IApiResponse<T = any> {
  status: 'OK' | 'ERROR' | 'VALIDATION_ERROR';
  message: string;
  data?: T;
  error?: any;
  timestamp: string;
}

export interface IAuthResponse {
  status: 'OK' | 'ERROR';
  message: string;
  data?: {
    token: string;
    user: Partial<IUser>;
  };
  timeline?: string;
  error?: any;
}

// Pagination
export interface IPaginationQuery {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Express Request with Authentication
export interface authenticatedRequest extends Request {
  user?: IJWTPayload | any;
}

