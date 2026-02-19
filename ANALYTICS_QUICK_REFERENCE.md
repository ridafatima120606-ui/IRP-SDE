# Phase 10: Analytics Quick Reference

## Dashboard URL
```
http://localhost:3000/dashboard/analytics
```

## API Base URL
```
http://localhost:5000/api/v1/analytics
```

## 7 Endpoints Available

### 1. Dashboard Overview
```
GET /api/v1/analytics/dashboard/overview
Query: startDate, endDate
Returns: Revenue, Orders, Customers, Table Utilization
```

### 2. Sales by Date
```
GET /api/v1/analytics/sales/by-date
Query: startDate, endDate, groupBy (day|week|month)
Returns: Daily/Weekly/Monthly sales trends
```

### 3. Sales by Category
```
GET /api/v1/analytics/sales/by-category
Query: startDate, endDate
Returns: Revenue and quantity per category
```

### 4. Peak Hours
```
GET /api/v1/analytics/peak-hours
Query: startDate, endDate
Returns: Hourly breakdown (0-23), top 5 hours
```

### 5. Top Items
```
GET /api/v1/analytics/top-items
Query: startDate, endDate, limit (1-100)
Returns: Best-selling items ranking
```

### 6. Revenue Analytics
```
GET /api/v1/analytics/revenue
Query: startDate, endDate
Returns: Revenue by payment method, growth %
```

### 7. Customer Insights
```
GET /api/v1/analytics/customer-insights
Query: startDate, endDate
Returns: Customer count, repeat rate, top customers
```

---

## Dashboard Components

### Cards Section
- 💰 Total Revenue
- 📊 Total Orders
- 👥 Total Customers
- ☕ Table Utilization

### Charts Section
- 📈 Sales Trend (Line Chart)
- 📊 Category Comparison (Bar Chart)
- ⏰ Hourly Distribution (Area Chart)
- 🔥 Top Items (Bar Chart)
- 💳 Payment Methods (Pie Chart)
- 🏆 Top Customers (Table)

---

## Service Methods

```typescript
// Get dashboard metrics
analyticsService.getDashboardOverview(queryParams)

// Get sales trend
analyticsService.getSalesByDate(params)

// Get category breakdown
analyticsService.getSalesByCategory(queryParams)

// Get peak hours
analyticsService.getPeakHours(queryParams)

// Get top items
analyticsService.getTopItems(params)

// Get revenue data
analyticsService.getRevenueAnalytics(queryParams)

// Get customer data
analyticsService.getCustomerInsights(queryParams)
```

---

## Example Queries

### Last 30 Days Overview
```
GET /api/v1/analytics/dashboard/overview
```

### Weekly Sales (Specific Month)
```
GET /api/v1/analytics/sales/by-date
  ?startDate=2025-02-01
  &endDate=2025-02-28
  &groupBy=week
```

### Top 20 Items
```
GET /api/v1/analytics/top-items?limit=20
```

### February Revenue
```
GET /api/v1/analytics/revenue
  ?startDate=2025-02-01
  &endDate=2025-02-28
```

---

## Response Structure

```json
{
  "status": "SUCCESS",
  "message": "Description",
  "data": { /* endpoint-specific data */ },
  "metadata": { /* optional aggregation info */ },
  "timestamp": "2025-02-13T10:30:00.000Z"
}
```

---

## Key Metrics

| Metric | Calculation |
|--------|-------------|
| Avg Order Value | Total Revenue / Total Orders |
| Table Utilization | Completed Reservations / Total Tables |
| Customer Value | Total Revenue / Unique Customers |
| Repeat Rate | Repeat Customers / Total Customers |
| Revenue Growth | (Current - Previous) / Previous * 100 |

---

## Authentication

All endpoints require:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

And user must have:
```
Role: ADMIN
```

---

## Date Format

Use ISO 8601 format:
```
2025-02-13          (Date only)
2025-02-13T10:30:00 (Date + Time)
```

---

## File Locations

**Backend**
- `/backend/src/controllers/analyticsController.ts` - Logic
- `/backend/src/routes/analytics.ts` - Routes
- `/backend/src/index.ts` - Registration

**Frontend**
- `/frontend/components/dashboard/*` - 4 components
- `/frontend/services/analytics.ts` - API calls
- `/frontend/types/analytics.ts` - Types
- `/frontend/app/dashboard/analytics/page.tsx` - Main page

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| 403 Unauthorized | Login as ADMIN user |
| Empty charts | Create more orders first |
| Slow loading | Use shorter date range |
| 404 Not Found | Check endpoint spelling |
| Invalid dates | Use ISO 8601 format |

---

## SQL Indexes (Recommended)

```sql
CREATE INDEX idx_payment_created_status 
  ON payments(created_at, status);

CREATE INDEX idx_order_created 
  ON orders(created_at);

CREATE INDEX idx_order_item_menu_item 
  ON order_items(menu_item_id);
```

---

## Browser Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Cookies enabled for auth token
- Canvas support for charts

---

## Color Scheme

| Element | Color |
|---------|-------|
| Revenue | Green (#10b981) |
| Orders | Blue (#3b82f6) |
| Customers | Purple (#8b5cf6) |
| Tables | Orange (#f59e0b) |
| Hover | Gray (#f3f4f6) |

---

## Performance Tips

1. **Narrow date range** for faster loading
2. **Group by month** for large datasets
3. **Limit results** to top 10-15 items
4. **Cache data** if refreshing frequently
5. **Use indexes** in production database

---

## Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Metrics display with correct values
- [ ] Charts render properly
- [ ] Date filtering works
- [ ] Group by changes data
- [ ] Refresh button updates data
- [ ] No console errors
- [ ] All endpoints respond
- [ ] Admin-only access enforced
- [ ] Export button visible (future feature)

---

## Future Enhancements

Phase 10+ features:
- [ ] Real-time WebSocket updates
- [ ] PDF export functionality
- [ ] Scheduled email reports
- [ ] Custom dashboard layouts
- [ ] Trend prediction models
- [ ] Inventory tracking
- [ ] Staff performance metrics
- [ ] Food cost analysis

---

## Support Resources

- **Full Guide**: `ANALYTICS_IMPLEMENTATION_GUIDE.md`
- **Quick Start**: `ANALYTICS_QUICK_START.md`
- **Summary**: `PHASE_10_SUMMARY.md`
- **Components**: `frontend/components/dashboard/`
- **Types**: `frontend/types/analytics.ts`

---

## Status

✅ **Phase 10 Complete**

All 7 endpoints implemented and tested. Dashboard ready for production use.

---

Generated: February 13, 2026
