export type PaymentMethod = 'CARD' | 'CASH' | 'DIGITAL_WALLET' | 'CRYPTOCURRENCY';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  paymentId: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  status: PaymentStatus;
  pdfInvoice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistoryItem extends Payment {
  order: {
    id: string;
    totalPrice: number;
    createdAt: string;
  };
}

export interface Invoice {
  paymentId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    serviceCharge: number;
    surcharge: number;
    total: number;
  };
}

export interface RefundRequest {
  paymentId: string;
  reason?: string;
}

export interface PaymentResponse<T> {
  status: string;
  message: string;
  data?: T;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
  timestamp: string;
}
