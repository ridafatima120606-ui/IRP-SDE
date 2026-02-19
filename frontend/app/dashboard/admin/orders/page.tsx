'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type OrderStatus = 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

interface OrderUser {
  id: string;
  name: string;
}

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  specialRequest?: string | null;
  menuItem?: {
    id?: string;
    name?: string;
    price?: number;
    category?: string;
  };
}

interface Order {
  id: string;
  user: OrderUser;
  items: OrderItem[];
  orderStatus: OrderStatus;
  tableId?: string | null;
  totalPrice: number;
  specialInstructions?: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface OrdersResponse {
  data: {
    orders: Order[];
  };
}

const ACTIVE_STATUSES: OrderStatus[] = ['CONFIRMED', 'PREPARING', 'READY'];

const STATUS_STYLES: Record<OrderStatus, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-amber-100 text-amber-700',
  READY: 'bg-emerald-100 text-emerald-700',
  SERVED: 'bg-slate-100 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-700'
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await apiClient.get<OrdersResponse>('/api/v1/orders/all/list');
      setOrders(response.data.orders ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch active orders';
      setError(message);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 15000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, isAdmin, isLoading, router]);

  const activeOrders = useMemo(
    () => orders.filter((order) => ACTIVE_STATUSES.includes(order.orderStatus)),
    [orders]
  );

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg">Loading...</p>
      </Card>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <Card className="p-8 border-red-200 bg-red-50">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Access Denied</h3>
            <p className="text-red-800">You do not have permission to access this page.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Active Customer Orders</h1>
          <p className="text-slate-600 mt-1">
            Showing live orders with status: Confirmed, Preparing, and Ready.
          </p>
        </div>
        <Button onClick={fetchOrders} disabled={isFetching} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50 text-red-700">
          Failed to load orders: {error}
        </Card>
      )}

      <Card className="p-4">
        <p className="text-sm text-slate-600">
          Active Orders: <span className="font-semibold text-slate-900">{activeOrders.length}</span>
        </p>
      </Card>

      <div className="space-y-4">
        {activeOrders.length === 0 && (
          <Card className="p-8 text-center text-slate-600">No active customer orders right now.</Card>
        )}

        {activeOrders.map((order) => (
          <Card key={order.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Order ID: {order.id}</p>
                <h2 className="text-xl font-semibold">{order.user?.name || 'Guest Customer'}</h2>
                <p className="text-sm text-slate-600">
                  Placed at {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600">
                  Last updated: {new Date(order.updatedAt || order.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-slate-700">
                  Table: {order.tableId || 'Not assigned'} | Items: {order.items.length} | Qty:{' '}
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
                <p className="text-sm text-slate-700 font-medium">
                  Total: Rs. {Number(order.totalPrice || 0).toFixed(2)}
                </p>
                <div className="pt-2">
                  <p className="text-sm font-semibold text-slate-800">Customer Ordered:</p>
                  <div className="text-sm text-slate-700 space-y-1 mt-1">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        - {item.menuItem?.name || item.menuItemId} x {item.quantity}
                        {item.specialRequest ? ` (${item.specialRequest})` : ''}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-sm font-semibold text-slate-800">Customer Activity:</p>
                  <p className="text-sm text-slate-700 mt-1">
                    Order placed at {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-700">
                    Current kitchen status set by employee: {order.orderStatus}
                  </p>
                </div>
                {order.specialInstructions && (
                  <p className="text-sm text-slate-700">Special Instructions: {order.specialInstructions}</p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  STATUS_STYLES[order.orderStatus]
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
