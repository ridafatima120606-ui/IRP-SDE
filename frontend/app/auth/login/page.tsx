'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { ChefHat } from 'lucide-react';
import { getUserRoleFromToken, isTokenValid } from '@/utils/auth';

export default function LoginPage() {
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isTokenValid()) {
      const role = getUserRoleFromToken();
      if (role === 'ADMIN') {
        router.push('/dashboard/admin');
        return;
      }
      if (role === 'CHEF') {
        router.push('/dashboard/employee');
        return;
      }
      const booking = localStorage.getItem('table_booking');
      router.push(booking ? '/menu' : '/booking');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-80 h-80 bg-orange-200 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-80 h-80 bg-blue-200 rounded-full opacity-10 blur-3xl"></div>

      <div className="relative z-10 w-full">
        <div className="flex flex-col items-center justify-center mb-8">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-2">
            <div className="p-3 bg-orange-600 rounded-lg">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Smart Dining</h1>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome to Smart Dining
            </h2>
            <p className="text-lg text-gray-600">
              Experience intelligent restaurant management
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex justify-center">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700 mb-3">Need help?</p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="mailto:support@smartdining.com" className="text-orange-600 hover:text-orange-700 font-medium">
              📧 Email Support
            </a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
              ❓ FAQ
            </a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
              💬 Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
