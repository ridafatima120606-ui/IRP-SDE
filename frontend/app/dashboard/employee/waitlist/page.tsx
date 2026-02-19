'use client';

import { useAuth } from '@/hooks/useAuth';
import WaitlistManagement from '@/components/waitlist/WaitlistManagement';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function EmployeeWaitlistPage() {
  const { isAuthenticated, isChef, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg">Loading...</p>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg">Please log in to access this page.</p>
      </Card>
    );
  }

  if (!isChef) {
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
      <h1 className="text-3xl font-bold">Waitlist Management - Employee</h1>
      <WaitlistManagement />
    </div>
  );
}

