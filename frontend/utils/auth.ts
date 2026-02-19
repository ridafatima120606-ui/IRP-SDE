import Cookies from 'js-cookie';

// Token key
const TOKEN_KEY = 'auth_token';

/**
 * Get stored JWT token from cookies
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return Cookies.get(TOKEN_KEY) || null;
};

/**
 * Set JWT token in cookies
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  Cookies.set(TOKEN_KEY, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

/**
 * Remove JWT token from cookies
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  Cookies.remove(TOKEN_KEY);
};

/**
 * Check if token is valid (basic check - just checks existence)
 * For more robust checking, verify with backend
 */
export const isTokenValid = (): boolean => {
  const token = getToken();
  return !!token && token.length > 0;
};

/**
 * Decode JWT to get user info (without verification)
 * WARNING: This only decodes, doesn't verify signature
 */
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const token = getToken();
  if (!token) {
    return true;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // Convert exp (in seconds) to milliseconds and compare with current time
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Get user ID from token
 */
export const getUserIdFromToken = (): string | null => {
  const token = getToken();
  if (!token) {
    return null;
  }

  const decoded = decodeToken(token);
  return decoded?.id || decoded?.sub || null;
};

/**
 * Get user role from token
 */
export const getUserRoleFromToken = (): string | null => {
  const token = getToken();
  if (!token) {
    return null;
  }

  const decoded = decodeToken(token);
  return decoded?.role || null;
};
