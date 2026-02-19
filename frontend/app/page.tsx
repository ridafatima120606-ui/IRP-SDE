'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isTokenValid } from '@/utils/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated || isTokenValid()) {
      const booking = localStorage.getItem('table_booking');
      if (booking) {
        router.push('/menu');
      } else {
        router.push('/booking');
      }
    } else {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Redirecting...</p>
      </div>
    </div>
  );
}
