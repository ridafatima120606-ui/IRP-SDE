'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import Cookies from 'js-cookie';
import { decodeToken } from '@/utils/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('auth_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fast-path: hydrate from token so protected pages don't stay blocked.
        const decoded = decodeToken(token);
        if (decoded?.id && decoded?.email && decoded?.role) {
          setUser({
            id: decoded.id,
            email: decoded.email,
            name: decoded.name || decoded.email.split('@')[0] || 'User',
            role: decoded.role,
          });
          setIsLoading(false);
        }

        const response = await Promise.race([
          authService.getCurrentUser(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth check timeout')), 5000)
          ),
        ]);

        if ((response as any)?.data?.user) {
          setUser((response as any).data.user);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        Cookies.remove('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authService.login({ email, password });
        // Handle both response formats
        const userData = (response as any)?.data?.user || (response as any)?.user;
        console.log('useAuth login response:', response, 'userData:', userData);
        if (userData) {
          setUser(userData);
        }
        // Don't push here - let caller decide based on role
      } catch (err: any) {
        const message = err.response?.data?.message || 'Login failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, name: string, phone?: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authService.register({ email, password, name, phone });
        setUser(response.data.user);
        router.push('/dashboard');
      } catch (err: any) {
        const message = err.response?.data?.message || 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isChef = user?.role === 'CHEF';
  const isCustomer = user?.role === 'CUSTOMER';

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isChef,
    isCustomer,
    login,
    register,
    logout,
  };
};
