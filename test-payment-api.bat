@echo off
REM Payment API Testing Script (Windows)
REM This script tests all payment endpoints using curl

setlocal enabledelayedexpansion

set API_URL=http://localhost:5000/api/v1
set AUTH_TOKEN=your_jwt_token_here

echo =================================
echo Smart Dining Payment API Testing
echo =================================
echo.

echo 1. Creating Payment Intent...
curl -X POST "%API_URL%/payments/intent" ^
  -H "Authorization: Bearer %AUTH_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\": \"test_order_123\", \"amount\": 49.99, \"currency\": \"usd\", \"paymentMethod\": \"card\"}"
echo.
echo.

echo 2. Getting Payment History...
curl -X GET "%API_URL%/payments/history?limit=5^&offset=0" ^
  -H "Authorization: Bearer %AUTH_TOKEN%"
echo.
echo.

echo 3. Getting Payment Details (use actual payment ID)...
curl -X GET "%API_URL%/payments/PAYMENT_ID_HERE" ^
  -H "Authorization: Bearer %AUTH_TOKEN%"
echo.
echo.

echo 4. Generating Invoice...
curl -X GET "%API_URL%/payments/PAYMENT_ID_HERE/invoice" ^
  -H "Authorization: Bearer %AUTH_TOKEN%"
echo.
echo.

echo 5. Refunding Payment...
curl -X POST "%API_URL%/payments/PAYMENT_ID_HERE/refund" ^
  -H "Authorization: Bearer %AUTH_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"reason\": \"Customer requested refund\"}"
echo.
echo.

echo === Testing Complete ===
echo.
echo Notes:
echo - Replace AUTH_TOKEN with a real JWT token from /auth/login
echo - Replace PAYMENT_ID_HERE with an actual payment ID
echo - Use test card: 4242 4242 4242 4242 for Stripe testing
echo.

pause
