'use client';

import { useAuth } from '@/hooks/useAuth';
import WaitlistStatus from '@/components/waitlist/WaitlistStatus';
import WaitlistJoinForm from '@/components/waitlist/WaitlistJoinForm';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function WaitlistPage() {
  const { isAuthenticated } = useAuth();
  const [showJoinForm, setShowJoinForm] = useState(false);

  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg">Please log in to access the waitlist.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Waitlist Management</h1>
        {!showJoinForm && (
          <button
            onClick={() => setShowJoinForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Join Waitlist
          </button>
        )}
      </div>

      {showJoinForm ? (
        <div className="max-w-md">
          <WaitlistJoinForm />
          <button
            onClick={() => setShowJoinForm(false)}
            className="mt-4 text-blue-600 hover:underline"
          >
            Cancel
          </button>
        </div>
      ) : (
        <WaitlistStatus />
      )}
    </div>
  );
}
