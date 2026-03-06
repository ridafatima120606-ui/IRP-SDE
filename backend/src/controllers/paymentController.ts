import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticatedRequest } from '../types';
import Stripe from 'stripe';
import PDFDocument from 'pdfkit';
import { mockDatabase } from '../utils/mockDatabase';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const finalizeOrderAfterSuccessfulPayment = async (orderId: string) => {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: 'SERVED' },
    select: {
      id: true,
      tableId: true
    }
  });

  if (order.tableId) {
    try {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'AVAILABLE' }
      });
    } catch (error) {
      console.warn(`Failed to release table ${order.tableId} after payment:`, error);
    }
  }

  return order;
};

// Create payment intent for checkout
export const createPaymentIntent = async (req: authenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { orderId, amount, currency = 'usd', paymentMethod = 'card' } = req.body;

    // Validation
    if (!orderId || !amount) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [
          { field: 'orderId', message: 'Order ID is required' },
          { field: 'amount', message: 'Amount is required' }
        ],
        timestamp: new Date().toISOString()
      });
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Order not found',
        timestamp: new Date().toISOString()
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        status: 'FORBIDDEN',
        message: 'You do not have permission to access this order',
        timestamp: new Date().toISOString()
      });
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId }
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Payment already completed for this order',
        timestamp: new Date().toISOString()
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      metadata: {
        orderId,
        userId,
        paymentMethod
      }
    });

    // Save payment record (or update if exists)
    const payment = await prisma.payment.upsert({
      where: { orderId },
      update: {
        amount,
        method: mapPaymentMethod(paymentMethod) as any,
        transactionId: paymentIntent.id
      },
      create: {
        orderId,
        amount,
        method: mapPaymentMethod(paymentMethod) as any,
        transactionId: paymentIntent.id,
        status: 'PENDING'
      }
    });

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Payment intent created successfully',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
        paymentId: payment.id
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to create payment intent',
      timestamp: new Date().toISOString()
    });
  }
};

// Simple checkout payment endpoint used by frontend checkout flow
export const processCheckoutPayment = async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR', method = 'card', customer, items = [], discounts } = req.body || {};

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Amount must be greater than zero',
        timestamp: new Date().toISOString()
      });
    }

    const normalizedItems = Array.isArray(items)
      ? items
          .map((item: any) => ({
            menuItemId: String(item?.itemId || item?.menuItemId || 'manual-item'),
            quantity: Math.max(1, Number(item?.quantity || 1)),
            price: Number(item?.price || 0),
          }))
          .filter((item) => Number.isFinite(item.price))
      : [];

    const fallbackItems =
      normalizedItems.length > 0
        ? normalizedItems
        : [{ menuItemId: 'manual-item', quantity: 1, price: Number(amount) }];

    const mockUserId = customer?.email
      ? `customer_${String(customer.email).toLowerCase()}`
      : `customer_${Date.now()}`;

    const createdOrder = mockDatabase.createOrder(mockUserId, fallbackItems);

    // In development/mock mode, acknowledge payment and return created mock order ID.
    const paymentId = `pay_${Date.now()}`;
    return res.status(201).json({
      status: 'SUCCESS',
      message: 'Payment processed successfully',
      data: {
        id: paymentId,
        orderId: createdOrder.id,
        amount: Number(amount),
        currency,
        method,
        customer: customer || null,
        items,
        discounts: discounts || null,
        paidAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Process checkout payment error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to process payment',
      timestamp: new Date().toISOString()
    });
  }
};

// Confirm payment after Stripe webhook or manual confirmation
export const confirmPayment = async (req: authenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId && !orderId) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [{ field: 'paymentIntentId or orderId', message: 'One is required' }],
        timestamp: new Date().toISOString()
      });
    }

    let payment;

    // Find payment by Stripe ID or Order ID
    if (paymentIntentId) {
      payment = await prisma.payment.findFirst({
        where: { transactionId: paymentIntentId },
        include: { order: true }
      });
    } else {
      payment = await prisma.payment.findUnique({
        where: { orderId },
        include: { order: true }
      });
    }

    if (!payment) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Payment not found',
        timestamp: new Date().toISOString()
      });
    }

    // Verify ownership
    if (payment.order.userId !== userId) {
      return res.status(403).json({
        status: 'FORBIDDEN',
        message: 'You do not have permission to access this payment',
        timestamp: new Date().toISOString()
      });
    }

    // Verify with Stripe if using payment intent ID
    if (paymentIntentId) {
      const stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (stripePaymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Payment has not been successfully processed',
          data: { stripeStatus: stripePaymentIntent.status },
          timestamp: new Date().toISOString()
        });
      }
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED' }
    });

    // Finalize order and release table
    await finalizeOrderAfterSuccessfulPayment(payment.orderId);

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Payment confirmed successfully',
      data: {
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        amount: updatedPayment.amount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Confirm payment error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to confirm payment',
      timestamp: new Date().toISOString()
    });
  }
};

// Refund payment
export const refundPayment = async (req: authenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { include: { user: true } } }
    });

    if (!payment) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Payment not found',
        timestamp: new Date().toISOString()
      });
    }

    if (payment.status === 'REFUNDED') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Payment has already been refunded',
        timestamp: new Date().toISOString()
      });
    }

    if (payment.status !== 'COMPLETED') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Only completed payments can be refunded',
        timestamp: new Date().toISOString()
      });
    }

    // Process refund with Stripe if payment intent exists
    if (payment.transactionId) {
      try {
        await stripe.refunds.create({
          payment_intent: payment.transactionId,
          reason: reason || 'requested_by_customer'
        });
      } catch (stripeError: any) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Failed to process refund with payment provider',
          data: { stripeError: stripeError.message },
          timestamp: new Date().toISOString()
        });
      }
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' }
    });

    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { orderStatus: 'CANCELLED' }
    });

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Payment refunded successfully',
      data: {
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        refundedAmount: updatedPayment.amount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Refund payment error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to refund payment',
      timestamp: new Date().toISOString()
    });
  }
};

// Get payment history for user
export const getPaymentHistory = async (req: authenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = '10', offset = '0' } = req.query;

    const payments = await prisma.payment.findMany({
      where: {
        order: {
          userId
        }
      },
      include: {
        order: {
          select: {
            id: true,
            totalPrice: true,
            createdAt: true
          }
        }
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.payment.count({
      where: {
        order: {
          userId
        }
      }
    });

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Payment history retrieved successfully',
      data: payments,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get payment history error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to retrieve payment history',
      timestamp: new Date().toISOString()
    });
  }
};

// Get payment details
export const getPaymentDetails = async (req: authenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true
              }
            },
            items: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    price: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Payment not found',
        timestamp: new Date().toISOString()
      });
    }

    // Verify ownership
    if (payment.order.userId !== userId) {
      return res.status(403).json({
        status: 'FORBIDDEN',
        message: 'You do not have permission to access this payment',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Payment details retrieved successfully',
      data: payment,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get payment details error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to retrieve payment details',
      timestamp: new Date().toISOString()
    });
  }
};

// Generate invoice PDF
export const generateInvoice = async (req: authenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                menuItem: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Payment not found',
        timestamp: new Date().toISOString()
      });
    }

    // Verify ownership
    if (payment.order.userId !== userId) {
      return res.status(403).json({
        status: 'FORBIDDEN',
        message: 'You do not have permission to access this payment',
        timestamp: new Date().toISOString()
      });
    }

    // Prepare invoice data
    const invoiceData = {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      date: payment.createdAt,
      user: {
        name: payment.order.user.name,
        email: payment.order.user.email,
        phone: payment.order.user.phone
      },
      items: payment.order.items.map((item: any) => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.menuItem.price,
        total: item.quantity * item.menuItem.price
      })),
      totals: {
        subtotal: payment.order.totalPrice - payment.order.taxAmount - payment.order.serviceCharge - payment.order.surcharge,
        tax: payment.order.taxAmount,
        serviceCharge: payment.order.serviceCharge,
        surcharge: payment.order.surcharge,
        total: payment.order.totalPrice
      }
    };

    // If client requests PDF, stream it
    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${payment.id}.pdf`);
      const doc = new PDFDocument();
      doc.pipe(res);

      doc.fontSize(20).text('Invoice', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice ID: ${invoiceData.paymentId}`);
      doc.text(`Order ID: ${invoiceData.orderId}`);
      doc.text(`Date: ${new Date(invoiceData.date).toLocaleString()}`);
      doc.text(`Status: ${invoiceData.status}`);
      doc.moveDown();
      doc.text(`Customer: ${invoiceData.user.name}`);
      doc.text(`Email: ${invoiceData.user.email}`);
      doc.text(`Phone: ${invoiceData.user.phone}`);
      doc.moveDown();
      doc.text('Items:');
      invoiceData.items.forEach((item: any) => {
        doc.text(`- ${item.name} x${item.quantity} @ $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`);
      });
      doc.moveDown();
      doc.text(`Subtotal: $${invoiceData.totals.subtotal.toFixed(2)}`);
      doc.text(`Tax: $${invoiceData.totals.tax.toFixed(2)}`);
      doc.text(`Service Charge: $${invoiceData.totals.serviceCharge.toFixed(2)}`);
      doc.text(`Surcharge: $${invoiceData.totals.surcharge.toFixed(2)}`);
      doc.font('Helvetica-Bold').text(`Total: $${invoiceData.totals.total.toFixed(2)}`);
      doc.end();
      return;
    }

    // Default: return invoice data as JSON
    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Invoice data retrieved successfully',
      data: invoiceData,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Generate invoice error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to generate invoice',
      timestamp: new Date().toISOString()
    });
  }
};


// Generate thermal-printer-friendly plain text receipt
export const generateThermalReceiptText = async (req: authenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                menuItem: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Payment not found',
        timestamp: new Date().toISOString()
      });
    }

    if (payment.order.userId !== userId) {
      return res.status(403).json({
        status: 'FORBIDDEN',
        message: 'You do not have permission to access this payment',
        timestamp: new Date().toISOString()
      });
    }

    const lines: string[] = [];
    lines.push('SMART DINING RECEIPT');
    lines.push('------------------------------');
    lines.push(`Receipt: ${payment.id}`);
    lines.push(`Order:   ${payment.orderId}`);
    lines.push(`Date:    ${new Date(payment.createdAt).toLocaleString()}`);
    lines.push(`Method:  ${payment.method}`);
    lines.push('------------------------------');

    payment.order.items.forEach((item: any) => {
      const name = item.menuItem?.name || 'Item';
      const unitPrice = Number(item.menuItem?.price || 0);
      const quantity = Number(item.quantity || 1);
      const total = unitPrice * quantity;
      lines.push(`${name}`);
      lines.push(`  ${quantity} x ${unitPrice.toFixed(2)} = ${total.toFixed(2)}`);
    });

    lines.push('------------------------------');
    lines.push(`Subtotal:       ${(payment.order.totalPrice - payment.order.taxAmount - payment.order.serviceCharge - payment.order.surcharge).toFixed(2)}`);
    lines.push(`Tax:            ${Number(payment.order.taxAmount || 0).toFixed(2)}`);
    lines.push(`Service Charge: ${Number(payment.order.serviceCharge || 0).toFixed(2)}`);
    lines.push(`Surcharge:      ${Number(payment.order.surcharge || 0).toFixed(2)}`);
    lines.push(`TOTAL:          ${Number(payment.order.totalPrice || 0).toFixed(2)}`);
    lines.push('------------------------------');
    lines.push('Thank you for dining with us!');

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Thermal receipt generated successfully',
      data: {
        paymentId: payment.id,
        orderId: payment.orderId,
        receiptText: lines.join('\n')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Generate thermal receipt error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Failed to generate thermal receipt',
      timestamp: new Date().toISOString()
    });
  }
};

// Helper function to map payment method string to enum
function mapPaymentMethod(method: string): string {
  const methodMap: { [key: string]: string } = {
    'card': 'CARD',
    'cash': 'CASH',
    'wallet': 'DIGITAL_WALLET',
    'cryptocurrency': 'CRYPTOCURRENCY'
  };
  return methodMap[method.toLowerCase()] || 'CARD';
}

// Stripe webhook handler for payment events
export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Webhook Error: ${err.message}`,
        timestamp: new Date().toISOString()
      });
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntentSucceeded.metadata?.orderId;

        if (orderId) {
          await prisma.payment.update({
            where: { orderId },
            data: { status: 'COMPLETED' }
          });

          await finalizeOrderAfterSuccessfulPayment(orderId);
        }
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
        const failedOrderId = paymentIntentFailed.metadata?.orderId;

        if (failedOrderId) {
          await prisma.payment.update({
            where: { orderId: failedOrderId },
            data: { status: 'FAILED' as any }
          });
        }
        break;

      case 'charge.refunded':
        const refundedCharge = event.data.object as Stripe.Charge;
        // Handle refund if payment intent ID is available
        if (refundedCharge.payment_intent) {
          const payment = await prisma.payment.findFirst({
            where: { transactionId: String(refundedCharge.payment_intent) }
          });

          if (payment) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'REFUNDED' }
            });
          }
        }
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Webhook processing failed',
      timestamp: new Date().toISOString()
    });
  }
};



