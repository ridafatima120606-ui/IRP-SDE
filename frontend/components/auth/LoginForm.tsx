'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting login for', email);
      const response = await authService.login({
        email: email.toLowerCase().trim(),
        password
      });

      console.log('Login response:', response);

      const token = (response as any)?.data?.token || (response as any)?.token;
      const user = (response as any)?.data?.user || (response as any)?.user;

      if (token) {
        // Token is automatically saved by axios interceptor
        // Redirect based on user role
        if (user?.role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else if (user?.role === 'CHEF') {
          router.push('/dashboard/employee');
        } else {
          router.push('/booking');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Login error response:', err.response || err);
      
      // Handle different error scenarios
      const respData = err.response?.data || err.data || null;
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 400) {
        setError(respData?.message || 'Please check your email and password');
      } else if (err.message === 'Network Error') {
        setError('Network error. Please check your connection.');
      } else if (respData && typeof respData === 'object') {
        setError(respData.message || JSON.stringify(respData));
      } else {
        setError(err.response?.data || err.message || 'An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) {
      setIsValidating(true);
    } else {
      setIsValidating(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-orange-200 shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold text-center text-orange-600">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your Smart Dining account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              onBlur={handleEmailBlur}
              disabled={isLoading}
              className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
                isValidating ? 'border-red-500' : ''
              }`}
              autoComplete="email"
            />
            {isValidating && (
              <p className="text-xs text-red-500">Please enter a valid email</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                disabled={isLoading}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                disabled={isLoading}
              />
              <span className="text-gray-600">Remember me</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Create one
            </Link>
          </div>

          {/* Demo Credentials (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <p className="font-semibold text-blue-900 mb-2">👤 Customer Demo:</p>
                <p className="text-blue-700">Email: demo@example.com</p>
                <p className="text-blue-700 mb-2">Password: password123</p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo@example.com');
                    setPassword('password123');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium underline text-xs"
                >
                  Auto-fill customer credentials
                </button>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
                <p className="font-semibold text-green-900 mb-2">👨‍💼 Admin Demo:</p>
                <p className="text-green-700">Email: admin@example.com</p>
                <p className="text-green-700 mb-2">Password: admin123</p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@example.com');
                    setPassword('admin123');
                  }}
                  className="text-green-600 hover:text-green-800 font-medium underline text-xs"
                >
                  Auto-fill admin credentials
                </button>
              </div>

              <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg text-xs">
                <p className="font-semibold text-violet-900 mb-2">Employee Demo:</p>
                <p className="text-violet-700">Email: employee@example.com</p>
                <p className="text-violet-700 mb-2">Password: employee123</p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('employee@example.com');
                    setPassword('employee123');
                  }}
                  className="text-violet-600 hover:text-violet-800 font-medium underline text-xs"
                >
                  Auto-fill employee credentials
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 bg-gray-200 h-px"></div>
          <div className="px-3 text-sm text-gray-500">or</div>
          <div className="flex-1 bg-gray-200 h-px"></div>
        </div>

        {/* Social Login (Placeholder) */}
        <div className="space-y-2 text-center text-xs text-gray-500">
          <p>Coming soon: Sign in with Google</p>
        </div>
      </CardContent>
    </Card>
  );
}
