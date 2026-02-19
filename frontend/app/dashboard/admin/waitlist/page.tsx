'use client';

import { useAuth } from '@/hooks/useAuth';
import WaitlistManagement from '@/components/waitlist/WaitlistManagement';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AdminWaitlistPage() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg">Please log in to access this page.</p>
      </Card>
    );
  }

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <Card className="p-8 border-red-200 bg-red-50">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Access Denied</h3>
            <p className="text-red-800">You don't have permission to access this page.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Waitlist Management - Admin</h1>
      <WaitlistManagement />
    </div>
  );
}
