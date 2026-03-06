import axios from 'axios';
import apiClient from '@/utils/api';
import { setToken, removeToken, getToken as getStoredToken } from '@/utils/auth';

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE = RAW_API_BASE.endsWith('/api/v1')
  ? RAW_API_BASE
  : `${RAW_API_BASE}/api/v1`;

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  preferences?: any;
  loyaltyPoints?: {
    id: string;
    userId: string;
    points: number;
    tier: string;
  };
  moodPreference?: any;
}

interface AuthResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: User;
  };
  timestamp?: string;
}

interface CurrentUserResponse {
  status: string;
  message: string;
  data: {
    user: User;
  };
  timestamp?: string;
}

export const authService = {
  /**
   * User registration
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE}/auth/register`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.data?.token) {
        setToken(response.data.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  /**
   * User login
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      // Use normalized API base to avoid duplicate /api/v1 in some env setups
      const response = await axios.post<AuthResponse>(
        `${API_BASE}/auth/login`,
        payload
      );

      const data = response.data;

      if (data?.data?.token) {
        setToken(data.data.token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * User logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(`${API_BASE}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },

  /**
   * Get current user info
   */
  getCurrentUser: async () => {
    try {
      return await apiClient.get<CurrentUserResponse>(`${API_BASE}/auth/me`);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: {
    name?: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await apiClient.put<AuthResponse>(
        `${API_BASE}/auth/profile`,
        data
      );
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn: (): boolean => {
    return !!getStoredToken();
  },

  /**
   * Get stored token
   */
  getToken: (): string | null => {
    return getStoredToken();
  },

  /**
   * Check if user is authenticated (verify with backend)
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = getStoredToken();
      if (!token) {
        return false;
      }

      await authService.getCurrentUser();
      return true;
    } catch (error) {
      removeToken();
      return false;
    }
  }
};
