import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/auth';
import { IJWTPayload } from '../types';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
      token?: string;
    }
  }
}

/**
 * Authentication middleware - Verifies JWT token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'No token provided',
        timestamp: new Date().toISOString(),
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
    }

    // Attach user and token to request object
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      message: 'Authentication error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Authorization middleware - Checks user role
 */
export const authorize = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'ERROR',
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * Optional authentication - Doesn't fail if no token provided
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
