# Phase 9: Payment Processing Implementation Guide

## Overview
Phase 9 implements a complete payment processing system using Stripe, including:
- Payment intent creation for checkout
- Secure card payment processing
- Invoice and receipt generation (PDF)
- Payment history tracking
- Refund handling

## Features Implemented

### Backend (Express.js + TypeScript)
✅ **Payment Controller** - 7 endpoints with full Stripe integration:
- `POST /api/v1/payments/intent` - Create payment intent
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/:id/refund` - Process refunds
- `GET /api/v1/payments/history` - View payment history
- `GET /api/v1/payments/:id` - Get payment details
- `GET /api/v1/payments/:id/invoice` - Generate invoice
- `POST /api/v1/payments/webhook/stripe` - Stripe webhook handler

✅ **Database Models**:
- Payment (with proper relationships to Order)
- Stores: transaction ID, amount, method, status, invoice

✅ **Security Features**:
- JWT authentication
- Role-based authorization (users can only access their own payments)
- Stripe webhook signature verification
- HTTPS enforcement in production

### Frontend (Next.js + React)
✅ **Components**:
- `PaymentCheckout` - Stripe Card Element integration
- `PaymentHistory` - View all past payments with pagination
- `InvoiceDisplay` - View and download invoices (JSON/PDF)

✅ **Services & Hooks**:
- `paymentService` - API integration with backend
- `usePayment` - React hook for payment state management

✅ **Utilities**:
- Format utilities for dates, currency, etc.
- Payment type definitions

## Environment Variables Required

### Backend (.env)
```
# Stripe Integration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smart_dining

# API Configuration
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
```

## Setup Instructions

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Get Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up for a free account
3. Go to Developers → API Keys
4. Copy your Secret Key (starts with `sk_test_`)
5. Copy your Publishable Key (starts with `pk_test_`)
6. For webhooks, go to Developers → Webhooks and create a new endpoint

### 3. Configure Environment Variables
```bash
# Backend/.env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend/.env.local
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_key_here
```

### 4. Run Servers
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

## API Usage Examples

### Create Payment Intent
```bash
curl -X POST http://localhost:5000/api/v1/payments/intent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_123",
    "amount": 29.99,
    "currency": "usd",
    "paymentMethod": "card"
  }'
```

### Confirm Payment
```bash
curl -X POST http://localhost:5000/api/v1/payments/confirm \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_1234567890"
  }'
```

### Get Payment History
```bash
curl -X GET "http://localhost:5000/api/v1/payments/history?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Generate Invoice
```bash
# Get JSON invoice
curl -X GET http://localhost:5000/api/v1/payments/payment_123/invoice \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Download PDF invoice
curl -X GET "http://localhost:5000/api/v1/payments/payment_123/invoice?format=pdf" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o invoice.pdf
```

### Refund Payment
```bash
curl -X POST http://localhost:5000/api/v1/payments/payment_123/refund \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer requested refund"
  }'
```

## Frontend Integration Example

```tsx
import { PaymentCheckout } from '@/components/payment/PaymentCheckout';
import { PaymentHistory } from '@/components/payment/PaymentHistory';
import { InvoiceDisplay } from '@/components/payment/InvoiceDisplay';
import { usePayment } from '@/hooks/usePayment';

export default function CheckoutPage({ orderId, amount }) {
  const payment = usePayment(orderId);
  const [showInvoice, setShowInvoice] = useState(false);
  
  return (
    <div>
      <PaymentCheckout 
        orderId={orderId} 
        amount={amount}
        onSuccess={(paymentId) => {
          console.log('Payment successful:', paymentId);
          setShowInvoice(paymentId);
        }}
      />
      
      {showInvoice && (
        <InvoiceDisplay 
          paymentId={showInvoice}
          onClose={() => setShowInvoice(null)}
        />
      )}
      
      <PaymentHistory />
    </div>
  );
}
```

## Testing Payment Processing

### Test Card Numbers (Stripe provides these for testing)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 2500 0000 3155

### Testing Webhook Events
1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward events: `stripe listen --forward-to localhost:5000/api/v1/payments/webhook/stripe`
4. Use the provided signing secret in your `.env`

## Stripe Webhook Events Handled
- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed

## Security Checklist
- [x] JWT authentication on all payment endpoints
- [x] User ownership verification (users can only access their payments)
- [x] Stripe webhook signature verification
- [x] No sensitive data logged to console in production
- [x] CORS configured properly
- [x] Error messages don't expose sensitive information

## Database Migrations
The Payment model is already defined in `backend/prisma/schema.prisma`. To apply:
```bash
cd backend
npx prisma migrate deploy
```

## Troubleshooting

### "Stripe API key not found"
- Check .env file has STRIPE_SECRET_KEY set
- Ensure key starts with `sk_test_` or `sk_live_`

### "Payment intent failed"
- Check Stripe dashboard for failed charges
- Verify amount is in correct format (whole cents)

### "Webhook not working"
- Ensure STRIPE_WEBHOOK_SECRET is set correctly
- Use Stripe CLI to test: `stripe trigger payment_intent.succeeded`

### "CORS error"
- Verify CORS_ORIGIN in backend .env matches frontend URL
- Check browser console for exact CORS error

## Next Steps
After payment processing, implement:
- Phase 10: Analytics & Reporting
- Phase 11: Advanced Features (Dynamic Pricing, Loyalty Rewards)
