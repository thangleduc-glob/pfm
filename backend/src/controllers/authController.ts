/**
 * Authentication controller
 * Handles HTTP requests for user authentication (register, login, logout)
 */

import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';
import { 
  validateLoginRequest,
  validateRegisterRequest,
  createAuthErrorResponse
} from '../schemas/authSchema';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const userData = validateRegisterRequest(req.body);

    // Register user through service
    const authResult = await authService.register(userData);

    // Set HttpOnly cookies for tokens
    res.cookie('accessToken', authResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refreshToken', authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Return user data (without tokens in body)
    logger.info('User registered successfully', { 
      userId: authResult.user.id,
      username: authResult.user.username 
    });

    res.status(201).json({
      user: authResult.user,
      message: 'User registered successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Username already exists') {
      logger.warn('Registration attempt with existing username', { 
        username: req.body.username 
      });
      
      res.status(409).json(
        createAuthErrorResponse('Username already exists', 'USERNAME_EXISTS')
      );
      return;
    }

    if (error instanceof Error && error.message.includes('validation')) {
      logger.warn('Registration validation failed', { 
        error: error.message 
      });
      
      res.status(400).json(
        createAuthErrorResponse('Validation failed', 'VALIDATION_ERROR')
      );
      return;
    }

    logger.error('Registration failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });

    res.status(500).json(
      createAuthErrorResponse('Registration failed', 'INTERNAL_ERROR')
    );
  }
}

/**
 * Authenticate user and login
 * POST /api/v1/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const credentials = validateLoginRequest(req.body);

    // Authenticate user through service
    const authResult = await authService.login(credentials);

    // Set HttpOnly cookies for tokens
    res.cookie('accessToken', authResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refreshToken', authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Return user data (without tokens in body)
    logger.info('User logged in successfully', { 
      userId: authResult.user.id,
      username: authResult.user.username 
    });

    res.status(200).json({
      user: authResult.user,
      message: 'Login successful',
    });
  } catch (error) {
    if (error instanceof Error && 
        (error.message === 'Invalid username or password' || 
         error.message === 'Username already exists')) {
      logger.warn('Login attempt with invalid credentials', { 
        username: req.body.username 
      });
      
      res.status(401).json(
        createAuthErrorResponse('Invalid username or password', 'INVALID_CREDENTIALS')
      );
      return;
    }

    if (error instanceof Error && error.message.includes('validation')) {
      logger.warn('Login validation failed', { 
        error: error.message 
      });
      
      res.status(400).json(
        createAuthErrorResponse('Validation failed', 'VALIDATION_ERROR')
      );
      return;
    }

    logger.error('Login failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });

    res.status(500).json(
      createAuthErrorResponse('Login failed', 'INTERNAL_ERROR')
    );
  }
}

/**
 * Logout user and clear cookies
 * POST /api/v1/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (should be attached by auth middleware)
    const userId = (req as any).user?.userId;

    if (userId) {
      // Log logout through service
      await authService.logout(userId);
      
      logger.info('User logged out successfully', { userId });
    }

    // Clear authentication cookies
    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0), // Immediately expire
      path: '/',
    });

    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0), // Immediately expire
      path: '/',
    });

    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });

    // Still clear cookies even if logout fails
    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    res.status(500).json(
      createAuthErrorResponse('Logout failed', 'INTERNAL_ERROR')
    );
  }
}

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json(
        createAuthErrorResponse('Refresh token is required', 'VALIDATION_ERROR')
      );
      return;
    }

    // Refresh token through service
    const authResult = await authService.refreshToken(refreshToken);

    // Set new access token cookie
    res.cookie('accessToken', authResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // Update refresh token cookie as well
    res.cookie('refreshToken', authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    logger.info('Token refreshed successfully', { 
      userId: authResult.user.id,
      username: authResult.user.username 
    });

    res.status(200).json({
      user: authResult.user,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    if (error instanceof Error && 
        (error.message === 'Invalid refresh token' || 
         error.message === 'User not found')) {
      logger.warn('Token refresh failed', { 
        error: error.message 
      });
      
      res.status(401).json(
        createAuthErrorResponse('Invalid refresh token', 'TOKEN_INVALID')
      );
      return;
    }

    logger.error('Token refresh failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });

    res.status(500).json(
      createAuthErrorResponse('Token refresh failed', 'INTERNAL_ERROR')
    );
  }
}

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    // User should be attached by auth middleware
    const user = (req as any).user;

    if (!user) {
      res.status(401).json(
        createAuthErrorResponse('Authentication required', 'AUTH_REQUIRED')
      );
      return;
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    logger.error('Get profile failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });

    res.status(500).json(
      createAuthErrorResponse('Failed to get profile', 'INTERNAL_ERROR')
    );
  }
}