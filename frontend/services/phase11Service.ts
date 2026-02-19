const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = RAW_API_BASE.endsWith('/api/v1')
  ? RAW_API_BASE
  : `${RAW_API_BASE}/api/v1`;
import {
  WaitlistEntry,
  WaitlistJoinRequest,
  WaitlistResponse,
  DynamicMenuResponse,
  ItemPriceResponse,
  DemandForecast,
  LoyaltyProfile,
  Reward,
  NotificationPreference,
  Notification,
} from '@/types/phase11';

/**
 * Waitlist Service
 */
export const waitlistService = {
  async joinWaitlist(data: WaitlistJoinRequest, token: string): Promise<WaitlistResponse> {
    const response = await fetch(`${API_BASE_URL}/waitlist/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to join waitlist');
    return response.json();
  },

  async getStatus(id: string, token: string): Promise<WaitlistEntry> {
    const response = await fetch(`${API_BASE_URL}/waitlist/status/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch status');
    return response.json();
  },

  async cancel(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/waitlist/${id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to cancel');
  },
};

/**
 * Pricing Service
 */
export const pricingService = {
  async getDynamicMenu(token?: string): Promise<DynamicMenuResponse> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/pricing/menu`, { headers });
    if (!response.ok) throw new Error('Failed to fetch menu');
    return response.json();
  },

  async getItemPrice(itemId: string, token?: string): Promise<ItemPriceResponse> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/pricing/item/${itemId}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch price');
    return response.json();
  },

  async getDemandForecast(token: string): Promise<DemandForecast[]> {
    const response = await fetch(`${API_BASE_URL}/pricing/forecast`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch forecast');
    const data = await response.json();
    return data.forecast;
  },
};

/**
 * Loyalty Service
 */
export const loyaltyService = {
  async getProfile(token: string): Promise<LoyaltyProfile> {
    const response = await fetch(`${API_BASE_URL}/loyalty/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  async getAvailableRewards(token: string): Promise<Reward[]> {
    const response = await fetch(`${API_BASE_URL}/loyalty/rewards`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch rewards');
    const data = await response.json();
    return data.rewards;
  },

  async redeemReward(rewardId: string, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/loyalty/redeem/${rewardId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to redeem reward');
    return response.json();
  },

  async getHistory(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/loyalty/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  async generateReferralCode(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/loyalty/referral/share`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to generate code');
    return response.json();
  },

  async useReferralCode(code: string, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/loyalty/referral/use`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ referralCode: code }),
    });
    if (!response.ok) throw new Error('Failed to use code');
    return response.json();
  },
};

/**
 * Notification Service
 */
export const notificationService = {
  async getNotifications(token: string, limit = 50, offset = 0): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/notifications?limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  async markAsRead(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to mark as read');
  },

  async delete(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete');
  },

  async getPreferences(token: string): Promise<NotificationPreference> {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch preferences');
    return response.json();
  },

  async updatePreferences(
    preferences: Partial<NotificationPreference>,
    token: string
  ): Promise<NotificationPreference> {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });
    if (!response.ok) throw new Error('Failed to update preferences');
    return response.json();
  },

  async sendTest(token: string): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to send test');
    return response.json();
  },
};
