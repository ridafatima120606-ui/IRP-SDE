'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ChefHat } from 'lucide-react';
import { isTokenValid } from '@/utils/auth';

export default function RegisterPage() {
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isTokenValid()) {
      router.push('/dashboard');
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
              Join Smart Dining Today
            </h2>
            <p className="text-lg text-gray-600">
              Create your account and start exploring amazing dining experiences
            </p>
          </div>
        </div>

        {/* Register Form */}
        <div className="flex justify-center">
          <RegisterForm />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            By creating an account, you agree to our{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
