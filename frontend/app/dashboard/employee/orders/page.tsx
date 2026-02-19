'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type OrderStatus = 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  menuItem?: {
    name?: string;
  };
}

interface Order {
  id: string;
  user?: { name?: string };
  orderStatus: OrderStatus;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersResponse {
  data: {
    orders: Order[];
  };
}

const ACTIVE_STATUSES: OrderStatus[] = ['CONFIRMED', 'PREPARING', 'READY'];
const NEXT_STATUS: Record<'CONFIRMED' | 'PREPARING' | 'READY', OrderStatus> = {
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'SERVED'
};

export default function EmployeeOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isChef, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await apiClient.get<OrdersResponse>('/api/v1/orders/all/list');
      setOrders(response.data.orders ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
    } finally {
      setIsFetching(false);
    }
  };

  const setOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setError(null);
    try {
      await apiClient.patch(`/api/v1/orders/${orderId}/status`, { status });
      await fetchOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      setError(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!isChef) {
      router.push('/dashboard');
      return;
    }
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 10000);
    return () => clearInterval(intervalId);
  }, [isLoading, isAuthenticated, isChef, router]);

  const activeOrders = useMemo(
    () => orders.filter((order) => ACTIVE_STATUSES.includes(order.orderStatus)),
    [orders]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Order Control - Employee</h1>
            <p className="text-slate-600 mt-1">Set customer order status: Confirmed, Preparing, Ready.</p>
          </div>
          <Button onClick={fetchOrders} disabled={isFetching} variant="outline" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && <Card className="p-4 border-red-200 bg-red-50 text-red-700">{error}</Card>}

        <Card className="p-4">
          <p className="text-sm text-slate-600">
            Active Orders: <span className="font-semibold text-slate-900">{activeOrders.length}</span>
          </p>
        </Card>

        <div className="space-y-4">
          {activeOrders.length === 0 && (
            <Card className="p-8 text-center text-slate-600">No active orders right now.</Card>
          )}

          {activeOrders.map((order) => (
            <Card key={order.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">Order ID: {order.id}</p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {order.user?.name || 'Customer'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    Placed: {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-700">Status: {order.orderStatus}</p>
                  <p className="text-sm text-slate-700">Total: Rs. {Number(order.totalPrice).toFixed(2)}</p>
                  <div className="text-sm text-slate-700">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        - {item.menuItem?.name || item.menuItemId} x {item.quantity}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[220px]">
                  <Button
                    onClick={() => setOrderStatus(order.id, 'CONFIRMED')}
                    disabled={updatingOrderId === order.id || order.orderStatus === 'CONFIRMED'}
                    variant={order.orderStatus === 'CONFIRMED' ? 'default' : 'outline'}
                  >
                    Mark Confirmed
                  </Button>
                  <Button
                    onClick={() => setOrderStatus(order.id, 'PREPARING')}
                    disabled={updatingOrderId === order.id || order.orderStatus === 'PREPARING'}
                    variant={order.orderStatus === 'PREPARING' ? 'default' : 'outline'}
                  >
                    Mark Preparing
                  </Button>
                  <Button
                    onClick={() => setOrderStatus(order.id, 'READY')}
                    disabled={updatingOrderId === order.id || order.orderStatus === 'READY'}
                    variant={order.orderStatus === 'READY' ? 'default' : 'outline'}
                  >
                    Mark Ready
                  </Button>
                  <Button
                    onClick={() =>
                      setOrderStatus(
                        order.id,
                        (NEXT_STATUS[order.orderStatus as 'CONFIRMED' | 'PREPARING' | 'READY'] || 'SERVED') as OrderStatus
                      )
                    }
                    disabled={updatingOrderId === order.id}
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Quick Next Status
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

