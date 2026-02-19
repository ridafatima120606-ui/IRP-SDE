'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { BarChart3, Users, Clock, TrendingUp, Settings, LogOut, UtensilsCrossed, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth hook to finish loading
    if (authLoading) {
      return;
    }

    setIsLoading(false);

    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading || isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-orange-500">🍽️ Smart Dining Admin</h1>
            <p className="text-xs text-slate-400 mt-1">Restaurant Management System</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">Admin User</p>
              <p className="text-xs text-slate-400">admin@example.com</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">
            Welcome to Admin Dashboard
          </h2>
          <p className="text-xl text-slate-300">
            Manage your restaurant operations, pricing, waitlists, and analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold">Active Orders</p>
                <p className="text-3xl font-bold text-white mt-2">24</p>
            </div>
              <TrendingUp className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
            <p className="text-xs text-slate-500 mt-4">📈 +3 from yesterday</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold">Total Customers</p>
                <p className="text-3xl font-bold text-white mt-2">156</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
            <p className="text-xs text-slate-500 mt-4">👥 +12 new this week</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold">Avg Wait Time</p>
                <p className="text-3xl font-bold text-white mt-2">8 min</p>
              </div>
              <Clock className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
            <p className="text-xs text-slate-500 mt-4">⏱️ -2 min from last week</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold">Revenue (Today)</p>
                <p className="text-3xl font-bold text-white mt-2">₹8.2K</p>
              </div>
              <BarChart3 className="w-12 h-12 text-green-500 opacity-20" />
            </div>
            <p className="text-xs text-slate-500 mt-4">💰 +15% vs last day</p>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Waitlist Management */}
          <Link href="/dashboard/admin/waitlist">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 hover:border-orange-500 rounded-xl p-8 cursor-pointer transition-all hover:scale-105 h-full">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Waitlist Management</h3>
                  <p className="text-slate-400 text-sm">Monitor and manage customer waitlists in real-time</p>
                </div>
                <Clock className="w-10 h-10 text-purple-500 opacity-80" />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Current Queue</span>
                  <span className="font-semibold text-white">12 customers</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avg Wait</span>
                  <span className="font-semibold text-white">15 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Estimated Seating</span>
                  <span className="font-semibold text-white">8:30 PM</span>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                Manage Queue →
              </button>
            </div>
          </Link>

          {/* Dynamic Pricing */}
          <Link href="/dashboard/admin/pricing">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 hover:border-orange-500 rounded-xl p-8 cursor-pointer transition-all hover:scale-105 h-full">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Dynamic Pricing</h3>
                  <p className="text-slate-400 text-sm">Optimize menu pricing based on demand</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500 opacity-80" />
              </div>

              <div className="space-y-3 mb-6 bg-slate-900 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Peak Multiplier</span>
                  <span className="font-semibold text-green-400">1.2x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Off-Peak Discount</span>
                  <span className="font-semibold text-blue-400">0.85x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Current Status</span>
                  <span className="inline-block px-2 py-1 bg-green-500 text-white text-xs rounded-full">Active</span>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
                Adjust Pricing →
              </button>
            </div>
          </Link>
        </div>

        {/* Additional Admin Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Menu Management */}
          <Link href="/dashboard/admin/menu">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 hover:border-orange-500 rounded-xl p-6 cursor-pointer transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <UtensilsCrossed className="w-8 h-8 text-emerald-500" />
                <h4 className="text-lg font-bold text-white">Menu</h4>
              </div>
              <p className="text-slate-400 text-sm mb-4">Add items and control availability</p>
              <div className="text-xs text-slate-500">
                <p>Manage dish list</p>
                <p>Toggle availability</p>
                <p>Delete outdated items</p>
              </div>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/dashboard/analytics">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 hover:border-orange-500 rounded-xl p-6 cursor-pointer transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-8 h-8 text-blue-500" />
                <h4 className="text-lg font-bold text-white">Analytics</h4>
              </div>
              <p className="text-slate-400 text-sm mb-4">View detailed business metrics and reports</p>
              <div className="text-xs text-slate-500">
                <p>📊 Revenue Trends</p>
                <p>🎯 Customer Insights</p>
                <p>📈 Growth Metrics</p>
              </div>
            </div>
          </Link>

          {/* Active Orders */}
          <Link href="/dashboard/admin/orders">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 hover:border-orange-500 rounded-xl p-6 cursor-pointer transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="w-8 h-8 text-cyan-500" />
                <h4 className="text-lg font-bold text-white">Active Orders</h4>
              </div>
              <p className="text-slate-400 text-sm mb-4">Track customer orders in real time</p>
              <div className="text-xs text-slate-500">
                <p>Confirmed orders</p>
                <p>Preparing queue</p>
                <p>Ready to serve</p>
              </div>
            </div>
          </Link>

          {/* Settings */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 hover:border-orange-500 rounded-xl p-6 cursor-pointer transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-8 h-8 text-slate-400" />
              <h4 className="text-lg font-bold text-white">System Settings</h4>
            </div>
            <p className="text-slate-400 text-sm mb-4">Configure restaurant operations</p>
            <div className="text-xs text-slate-500">
              <p>⚙️ Menu Configuration</p>
              <p>🔐 User Management</p>
              <p>🌐 API Integration</p>
            </div>
          </div>

          {/* Reports */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 hover:border-orange-500 rounded-xl p-6 cursor-pointer transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-orange-500" />
              <h4 className="text-lg font-bold text-white">Reports</h4>
            </div>
            <p className="text-slate-400 text-sm mb-4">Generate and export business reports</p>
            <div className="text-xs text-slate-500">
              <p>📋 Order Reports</p>
              <p>👥 Customer Reports</p>
              <p>💹 Financial Reports</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Need Help?</h3>
          <p className="text-white mb-6 opacity-90">Access documentation, support, or explore advanced features</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-6 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors">
              View Docs
            </button>
            <button className="px-6 py-2 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
