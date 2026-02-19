'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { isTokenValid, removeToken } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, User, Heart, Leaf } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication on load
    const checkAuth = async () => {
      try {
        if (!isTokenValid()) {
          router.push('/auth/login');
          return;
        }

        const response = await authService.getCurrentUser();
        setUser(response.data?.user);
      } catch (err: any) {
        console.error('Auth check failed:', err);
        setError('Failed to load user data');
        removeToken();
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Failed to load user data'}</p>
            <Button onClick={() => router.push('/auth/login')} className="mt-4 w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-600">Smart Dining Dashboard</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}! 👋
          </h2>
          <p className="text-gray-600">
            Manage your reservations, orders, and dining preferences
          </p>
        </div>

        {/* User Profile Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-600" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{user.name}</p>
                </div>
                {user.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{user.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium text-orange-600 capitalize">{user.role?.toLowerCase()}</p>
                </div>
              </div>
              <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700" disabled>
                Edit Profile (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          {/* Loyalty Points Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Loyalty Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Current Points</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {user.loyaltyPoints?.points || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tier</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {user.loyaltyPoints?.tier?.toLowerCase() || 'Silver'}
                  </p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" disabled>
                Redeem Rewards (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Favorite Mood</p>
                  <p className="font-medium text-gray-900">
                    {user.moodPreference?.currentMood || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dietary Preferences</p>
                  <p className="text-sm text-gray-600">Not configured yet</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" disabled>
                Manage Preferences (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">📅</div>
              <h3 className="font-semibold mb-2">Make Reservation</h3>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/menu')}
          >
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <h3 className="font-semibold mb-2">Browse Menu</h3>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                View Menu
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">🎭</div>
              <h3 className="font-semibold mb-2">Mood Dining</h3>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-semibold mb-2">My Orders</h3>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
