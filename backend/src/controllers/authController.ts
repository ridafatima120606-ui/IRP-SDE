import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { hashPassword, comparePassword, generateToken } from '@/utils/auth';
import { IUserRequest, IAuthResponse, IJWTPayload } from '@/types';

/**
 * User Registration Controller
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body as IUserRequest;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'User already exists with this email',
        timestamp: new Date().toISOString(),
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'CUSTOMER',
      },
    });

    // Create loyalty points record
    await prisma.loyaltyPoints.create({
      data: {
        userId: user.id,
        points: 0,
        tier: 'SILVER',
      },
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    } as IJWTPayload);

    return res.status(201).json({
      status: 'OK',
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Registration failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * User Login Controller
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Email and password are required',
        timestamp: new Date().toISOString(),
      });
    }

    // Demo credentials - allow login without database
    if (email === 'demo@example.com' && password === 'password123') {
      const token = generateToken({
        id: 'demo-user-123',
        email: 'demo@example.com',
        role: 'CUSTOMER',
      } as IJWTPayload);

      return res.status(200).json({
        status: 'OK',
        message: 'Login successful',
        data: {
          token,
          user: {
            id: 'demo-user-123',
            email: 'demo@example.com',
            name: 'Demo User',
            role: 'CUSTOMER',
          },
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Admin demo account
    if (email === 'admin@example.com' && password === 'admin123') {
      const token = generateToken({
        id: 'admin-user-123',
        email: 'admin@example.com',
        role: 'ADMIN',
      } as IJWTPayload);

      return res.status(200).json({
        status: 'OK',
        message: 'Login successful',
        data: {
          token,
          user: {
            id: 'admin-user-123',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'ADMIN',
          },
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (email === 'employee@example.com' && password === 'employee123') {
      const token = generateToken({
        id: 'employee-user-123',
        email: 'employee@example.com',
        role: 'CHEF',
      } as IJWTPayload);

      return res.status(200).json({
        status: 'OK',
        message: 'Login successful',
        data: {
          token,
          user: {
            id: 'employee-user-123',
            email: 'employee@example.com',
            name: 'Employee User',
            role: 'CHEF',
          },
        },
        timestamp: new Date().toISOString(),
      });
    }

    try {
      // Try to find user in database
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          status: 'ERROR',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString(),
        });
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'ERROR',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString(),
        });
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      } as IJWTPayload);

      return res.status(200).json({
        status: 'OK',
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (dbError: any) {
      // If database is not available, allow demo login
      console.warn('Database error, allowing demo login:', dbError.message);
      
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Login failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get Current User Controller
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
    }

    // Support demo login flow even when database demo users do not exist
    if (req.user.id === 'demo-user-123' || req.user.email === 'demo@example.com') {
      return res.status(200).json({
        status: 'OK',
        message: 'Demo user retrieved successfully',
        data: {
          user: {
            id: 'demo-user-123',
            email: 'demo@example.com',
            name: 'Demo User',
            phone: null,
            role: 'CUSTOMER',
            preferences: null,
            loyaltyPoints: {
              id: 'demo-loyalty',
              userId: 'demo-user-123',
              points: 0,
              tier: 'SILVER',
            },
            moodPreference: null,
          },
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (req.user.id === 'admin-user-123' || req.user.email === 'admin@example.com') {
      return res.status(200).json({
        status: 'OK',
        message: 'Admin demo user retrieved successfully',
        data: {
          user: {
            id: 'admin-user-123',
            email: 'admin@example.com',
            name: 'Admin User',
            phone: null,
            role: 'ADMIN',
            preferences: null,
            loyaltyPoints: null,
            moodPreference: null,
          },
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (req.user.id === 'employee-user-123' || req.user.email === 'employee@example.com') {
      return res.status(200).json({
        status: 'OK',
        message: 'Employee demo user retrieved successfully',
        data: {
          user: {
            id: 'employee-user-123',
            email: 'employee@example.com',
            name: 'Employee User',
            phone: null,
            role: 'CHEF',
            preferences: null,
            loyaltyPoints: null,
            moodPreference: null,
          },
        },
        timestamp: new Date().toISOString(),
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        preferences: true,
        loyaltyPoints: true,
        moodPreference: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'User retrieved successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          preferences: user.preferences,
          loyaltyPoints: user.loyaltyPoints,
          moodPreference: user.moodPreference,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve user',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Logout Controller
 */
export const logout = async (req: Request, res: Response) => {
  // Token is handled by frontend (removed from cookies)
  // This is optional - mainly for audit purposes

  return res.status(200).json({
    status: 'OK',
    message: 'Logged out successfully',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Update User Profile Controller
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
    }

    const { name, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
      },
    });

    return res.status(200).json({
      status: 'OK',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          role: updatedUser.role,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update profile',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
