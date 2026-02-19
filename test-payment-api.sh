#!/bin/bash

# Payment API Testing Script
# This script tests all payment endpoints

API_URL="http://localhost:5000/api/v1"
AUTH_TOKEN="your_jwt_token_here"  # Replace with actual token

echo "=== Smart Dining Payment API Testing ==="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Create Payment Intent
echo -e "${YELLOW}1. Creating Payment Intent...${NC}"
INTENT_RESPONSE=$(curl -s -X POST "$API_URL/payments/intent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test_order_123",
    "amount": 49.99,
    "currency": "usd",
    "paymentMethod": "card"
  }')

echo "Response: $INTENT_RESPONSE"
PAYMENT_ID=$(echo $INTENT_RESPONSE | grep -o '"paymentId":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}Payment ID: $PAYMENT_ID${NC}"
echo ""

# Test 2: Get Payment Details
echo -e "${YELLOW}2. Getting Payment Details...${NC}"
curl -s -X GET "$API_URL/payments/$PAYMENT_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
echo ""

# Test 3: Get Payment History
echo -e "${YELLOW}3. Getting Payment History...${NC}"
curl -s -X GET "$API_URL/payments/history?limit=5&offset=0" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
echo ""

# Test 4: Generate Invoice (JSON)
echo -e "${YELLOW}4. Generating Invoice (JSON)...${NC}"
curl -s -X GET "$API_URL/payments/$PAYMENT_ID/invoice" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
echo ""

# Test 5: Generate Invoice (PDF) - Downloads file
echo -e "${YELLOW}5. Downloading Invoice PDF...${NC}"
curl -s -X GET "$API_URL/payments/$PAYMENT_ID/invoice?format=pdf" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -o "invoice_$PAYMENT_ID.pdf"
echo -e "${GREEN}Invoice saved to: invoice_$PAYMENT_ID.pdf${NC}"
echo ""

# Test 6: Refund Payment
echo -e "${YELLOW}6. Refunding Payment...${NC}"
REFUND_RESPONSE=$(curl -s -X POST "$API_URL/payments/$PAYMENT_ID/refund" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer requested refund"
  }')
echo "Response: $REFUND_RESPONSE"
echo ""

echo -e "${GREEN}=== Testing Complete ===${NC}"
echo ""
echo "Notes:"
echo "- Replace AUTH_TOKEN with a real JWT token from /auth/login"
echo "- Replace orderId with an actual order from the system"
echo "- Use test card: 4242 4242 4242 4242 for Stripe testing"
