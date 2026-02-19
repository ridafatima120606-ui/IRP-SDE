import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { IJWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generate JWT token
 */
export const generateToken = (payload: IJWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRE,
  } as any);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): IJWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET as string) as IJWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): IJWTPayload | null => {
  try {
    return jwt.decode(token) as IJWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (header: string | undefined): string | null => {
  if (!header) return null;
  
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};
