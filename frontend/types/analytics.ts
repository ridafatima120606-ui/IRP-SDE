/**
 * Analytics and Dashboard Types
 */

export interface DashboardMetrics {
  revenue: {
    total: number;
    transactions: number;
    average: number;
  };
  orders: {
    total: number;
    average: number;
  };
  customers: {
    total: number;
    returning: number;
  };
  tables: {
    total: number;
    utilization: number;
  };
  topItem: string | null;
}

export interface DashboardOverview {
  dateRange: {
    start: string;
    end: string;
  };
  data: DashboardMetrics;
}

export interface DailySalesData {
  date: string;
  revenue: number;
  transactions: number;
  methods: { [key: string]: number };
}

export interface SalesAnalytics {
  data: DailySalesData[];
  metadata: {
    totalSales: number;
    totalTransactions: number;
    groupBy: string;
  };
}

export interface CategorySales {
  category: string;
  revenue: number;
  quantity: number;
  orders: number;
  items: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface PeakHourData {
  hour: number;
  orders: number;
  revenue: number;
  avgOrderValue: number;
}

export interface PeakHoursAnalysis {
  hourlyBreakdown: PeakHourData[];
  peakHours: PeakHourData[];
  totalOrders: number;
  avgOrdersPerHour: number;
}

export interface TopItem {
  itemId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  orders: number;
  revenue: number;
  rating: number;
}

export interface RevenueAnalytics {
  dateRange: {
    start: string;
    end: string;
  };
  totalRevenue: number;
  totalTransactions: number;
  byPaymentMethod: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
  growth: {
    percentage: number;
    comparison: {
      current: number;
      previous: number;
    };
  };
}

export interface TopCustomer {
  userId: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  avgOrderValue: number;
}

export interface CustomerInsights {
  dateRange: {
    start: string;
    end: string;
  };
  totalCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
  avgCustomerValue: number;
  topCustomers: TopCustomer[];
}

export interface AnalyticsResponse<T> {
  status: string;
  message: string;
  data?: T;
  metadata?: any;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
  timestamp: string;
}

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface AnalyticsQueryParams extends DateRange {
  groupBy?: 'day' | 'week' | 'month';
  limit?: number;
}
