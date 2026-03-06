'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FloorPlanTable {
  id: string;
  tableNumber: number;
  capacity: number;
  location?: string | null;
  tableType?: string | null;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';
}

interface FloorPlanResponse {
  data: {
    summary: {
      available: number;
      reserved: number;
      occupied: number;
      maintenance: number;
    };
    tables: FloorPlanTable[];
  };
}

const STATUS_CLASSES: Record<FloorPlanTable['status'], string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  RESERVED: 'bg-amber-100 text-amber-700 border-amber-200',
  OCCUPIED: 'bg-rose-100 text-rose-700 border-rose-200',
  MAINTENANCE: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function AdminFloorPlanPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [tables, setTables] = useState<FloorPlanTable[]>([]);
  const [summary, setSummary] = useState({
    available: 0,
    reserved: 0,
    occupied: 0,
    maintenance: 0
  });
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);

  const loadFloorPlan = async () => {
    setFetching(true);
    setError('');
    try {
      const response = await apiClient.get<FloorPlanResponse>('/api/v1/tables/floor-plan');
      setTables(response.data.tables || []);
      setSummary(response.data.summary || summary);
    } catch (err: any) {
      setError(err?.message || 'Failed to load floor plan');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }

    loadFloorPlan();
    const intervalId = setInterval(loadFloorPlan, 15000);
    return () => clearInterval(intervalId);
  }, [isLoading, isAuthenticated, isAdmin, router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Floor Plan</h1>
          <p className="text-slate-600 mt-1">Live table occupancy and reservation status.</p>
        </div>
        <Button onClick={loadFloorPlan} disabled={fetching} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-sm text-slate-600">Available</p><p className="text-2xl font-semibold">{summary.available}</p></Card>
        <Card className="p-4"><p className="text-sm text-slate-600">Reserved</p><p className="text-2xl font-semibold">{summary.reserved}</p></Card>
        <Card className="p-4"><p className="text-sm text-slate-600">Occupied</p><p className="text-2xl font-semibold">{summary.occupied}</p></Card>
        <Card className="p-4"><p className="text-sm text-slate-600">Maintenance</p><p className="text-2xl font-semibold">{summary.maintenance}</p></Card>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50 text-red-700">{error}</Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className={`p-4 border ${STATUS_CLASSES[table.status]}`}>
            <p className="text-xs font-semibold">Table #{table.tableNumber}</p>
            <p className="text-sm mt-2">Capacity: {table.capacity}</p>
            <p className="text-sm">Location: {table.location || 'N/A'}</p>
            <p className="text-sm">Type: {table.tableType || 'Standard'}</p>
            <p className="text-xs mt-2 font-semibold">{table.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
