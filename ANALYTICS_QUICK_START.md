# Phase 10: Analytics & Reporting - Quick Start

## What's Implemented ✅

### Backend
- **7 Analytics Endpoints** using Prisma aggregations
- **Sales Analytics**: By date, by category
- **Peak Hours**: Hourly breakdown with predictions
- **Revenue Reports**: Payment method breakdown, growth analysis
- **Customer Insights**: Behavior analysis, top customers
- **Admin-only access**: Role-based authorization

### Frontend
- **Main Dashboard**: `/dashboard/analytics`
- **Metrics Cards**: Revenue, orders, customers, utilization
- **Sales Chart**: Line chart with trends
- **Category Comparison**: Bar chart analysis
- **Peak Hours Visualization**: Area chart with top hours list
- **Top Items**: Bar chart with rankings
- **Revenue Breakdown**: Pie chart by payment method
- **Customer Rankings**: Table with top customers

## Quick Access

### View Analytics
```
URL: http://localhost:3000/dashboard/analytics
Requirements: Admin login
Features:
  - Date range filtering (default: last 30 days)
  - Group by: Day / Week / Month
  - Refresh button for live data
  - Export button (future feature)
```

### API Endpoints

All require `Authorization: Bearer ADMIN_TOKEN`

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/analytics/dashboard/overview` | Key metrics |
| `GET /api/v1/analytics/sales/by-date` | Sales trends |
| `GET /api/v1/analytics/sales/by-category` | Category breakdown |
| `GET /api/v1/analytics/peak-hours` | Hourly analysis |
| `GET /api/v1/analytics/top-items` | Best sellers |
| `GET /api/v1/analytics/revenue` | Financial data |
| `GET /api/v1/analytics/customer-insights` | Customer data |

## Dashboard Walkthrough

### 1. Metrics Overview (4 cards)
```
💰 Total Revenue      👥 Total Customers
📊 Total Orders       ☕ Table Utilization
```

### 2. Sales Analytics
```
- Line chart: Revenue + Transaction trends
- Bar chart: Sales by category
```

### 3. Performance Metrics
```
- Area chart: Hourly distribution
- Top 5 peak hours list
- Bar chart: Top 10 items
```

### 4. Financial & Customer Data
```
- Revenue summary (current vs previous)
- Payment method breakdown (pie chart)
- Top customers table (rank, spending, avg order)
```

## Testing the Analytics

### 1. Create Test Data
```bash
# Login and place multiple orders
# Process multiple payments
# Make several reservations
# Use different payment methods
```

### 2. Navigate to Dashboard
```
1. Login as ADMIN
2. Go to /dashboard/analytics
3. Charts will auto-load
```

### 3. Test Filters
```
- Change date range
- Select different grouping (day/week/month)
- Click Refresh button
```

### 4. Verify Data
```
- Revenue totals match orders
- Dates filter correctly
- Charts update on refresh
- No errors in console
```

## Key Features

✅ **Date Range Filtering**
- Select any start/end date
- Default: last 30 days
- ISO 8601 format support

✅ **Flexible Grouping**
- Group by Day (detailed)
- Group by Week (weekly trends)
- Group by Month (overview)

✅ **Multiple Visualizations**
- Line charts for trends
- Bar charts for comparisons
- Area charts for distribution
- Pie charts for breakdown
- Tables for rankings

✅ **Real-time Calculations**
- Revenue aggregation
- Growth percentage
- Repeat rate
- Average metrics
- Utilization percentage

✅ **Security**
- ADMIN role required
- JWT authentication
- User isolation
- Safe aggregation (no sensitive data)

## Files Created

### Backend (3 new files)
```
src/controllers/analyticsController.ts - 7 endpoints
src/routes/analytics.ts - Route definitions
src/index.ts - Updated with routes
```

### Frontend (11 new files)
```
components/dashboard/DashboardMetricsDisplay.tsx
components/dashboard/SalesChart.tsx
components/dashboard/PeakHoursChart.tsx
components/dashboard/RevenueChart.tsx
app/dashboard/analytics/page.tsx
services/analytics.ts
types/analytics.ts
```

## Usage Examples

### Get Dashboard Metrics
```typescript
const metrics = await analyticsService.getDashboardOverview({
  startDate: '2025-01-01',
  endDate: '2025-02-13'
});
```

### Get Sales by Date
```typescript
const sales = await analyticsService.getSalesByDate({
  startDate: '2025-02-01',
  endDate: '2025-02-13',
  groupBy: 'week'
});
```

### Get Top Items
```typescript
const topItems = await analyticsService.getTopItems({
  limit: 15
});
```

### Get Customer Insights
```typescript
const insights = await analyticsService.getCustomerInsights({
  startDate: '2025-01-01',
  endDate: '2025-02-13'
});
```

## Customization

### Change Default Date Range
In `app/dashboard/analytics/page.tsx`:
```typescript
const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
// Change to:
const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
```

### Add New Metric
1. Add endpoint in `analyticsController.ts`
2. Add route in `analytics.ts`
3. Add service method in `services/analytics.ts`
4. Add type in `types/analytics.ts`
5. Create component in `components/dashboard/`
6. Add to `page.tsx`

### Change Chart Colors
In component files:
```typescript
stroke="#10b981"  // Change green color
fill="#3b82f6"    // Change blue color
```

## Troubleshooting

### Charts show "No data available"
- Create more orders first
- Verify date range contains data
- Check browser console for errors

### Empty metrics
- Ensure payments are marked as COMPLETED
- Check database has order data
- Verify date range is correct

### Slow performance
- Use smaller date range
- Reload page
- Check browser network tab

### 403 Unauthorized
- Login as ADMIN user
- Check JWT token is valid
- Refresh page

## Performance

Expected load times:
- Dashboard overview: <500ms
- Sales chart: <1 sec
- All charts: ~3 sec total
- Data refresh: <1 sec

## Database Optimization

Recommended indexes:
```sql
CREATE INDEX idx_payment_created_status ON payments(created_at, status);
CREATE INDEX idx_order_created ON orders(created_at);
CREATE INDEX idx_order_item_menu_item ON order_items(menu_item_id);
```

## Next Steps

1. **View Analytics Dashboard**
   - Navigate to `/dashboard/analytics`
   - Verify all charts load

2. **Test Data Filtering**
   - Change date ranges
   - Test different groupings
   - Refresh to verify updates

3. **Review Metrics**
   - Check revenue accuracy
   - Verify customer counts
   - Confirm peak hours

4. **Customize Dashboard**
   - Add custom metrics
   - Adjust colors/styling
   - Create custom reports

## Documentation

Full documentation in:
- `ANALYTICS_IMPLEMENTATION_GUIDE.md` - Complete reference
- `PHASE_10_SUMMARY.md` - Implementation details

## Support

For implementation details, see:
- Backend: `backend/src/controllers/analyticsController.ts`
- Frontend: `frontend/components/dashboard/`
- Types: `frontend/types/analytics.ts`
