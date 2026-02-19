'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Users, LogOut } from 'lucide-react';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isChef, isLoading, user, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!isChef) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, isChef, router]);

  if (isLoading || !isAuthenticated || !isChef) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading employee dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Employee Dashboard</h1>
            <p className="text-sm text-slate-600">{user?.name} ({user?.email})</p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid gap-6 md:grid-cols-2">
        <Link href="/dashboard/employee/waitlist">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold">Waitlist</h2>
            </div>
            <p className="text-slate-600">View queue, seat customers, and manage waiting status.</p>
          </Card>
        </Link>

        <Link href="/dashboard/employee/orders">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="flex items-center gap-3 mb-3">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Order Status</h2>
            </div>
            <p className="text-slate-600">Update orders to Confirmed, Preparing, and Ready.</p>
          </Card>
        </Link>
      </main>
    </div>
  );
}
