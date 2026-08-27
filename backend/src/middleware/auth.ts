/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user context to requests
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { userRepository } from '../repositories/userRepository';
import { logger } from '../utils/logger';
import { JwtPayload, AuthMiddlewareOptions } from '../types/auth';
import { createAuthErrorResponse } from '../schemas/authSchema';

/**
 * Extend Express Request interface to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
      };
      userId?: string;
    }
  }
}

/**
 * Authentication middleware factory
 * @param options - Configuration options for authentication
 * @returns Express middleware function
 */
export function authenticate(options: AuthMiddlewareOptions = {}) {
  const { required = true, tokenType = 'access' } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract token from cookies
      const tokenName = tokenType === 'access' ? 'accessToken' : 'refreshToken';
      const token = req.cookies?.[tokenName];

      if (!token) {
        if (required) {
          logger.warn('Authentication required but token missing', {
            path: req.path,
            method: req.method,
            ip: req.ip,
          });
          
          res.status(401).json(
            createAuthErrorResponse('Authentication required', 'AUTH_REQUIRED')
          );
          return;
        }
        
        // Token not required, continue without authentication
        next();
        return;
      }

      // Verify token based on type
      let payload: JwtPayload | null;
      
      if (tokenType === 'access') {
        payload = authService.verifyAccessToken(token);
      } else {
        payload = authService.verifyRefreshToken(token);
      }

      if (!payload) {
        if (required) {
          logger.warn('Invalid or expired token', {
            path: req.path,
            method: req.method,
            ip: req.ip,
            tokenType,
          });
          
          res.status(401).json(
            createAuthErrorResponse('Invalid or expired token', 'TOKEN_EXPIRED')
          );
          return;
        }
        
        // Token invalid but not required, continue without authentication
        next();
        return;
      }

      // Fetch user from database to ensure they still exist
      const user = await userRepository.findById(payload.userId);
      
      if (!user) {
        if (required) {
          logger.warn('User not found for valid token', {
            userId: payload.userId,
            path: req.path,
            method: req.method,
          });
          
          res.status(401).json(
            createAuthErrorResponse('User not found', 'USER_NOT_FOUND')
          );
          return;
        }
        
        // User not found but authentication not required
        next();
        return;
      }

      // Attach user information to request
      req.user = user;
      req.userId = user.id;

      // Log successful authentication
      logger.debug('Authentication successful', {
        userId: user.id,
        username: user.username,
        path: req.path,
        method: req.method,
      });

      next();
    } catch (error) {
      logger.error('Authentication middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      if (required) {
        res.status(500).json(
          createAuthErrorResponse('Authentication failed', 'INTERNAL_ERROR')
        );
        return;
      }

      // If authentication is not required, continue despite error
      next();
    }
  };
}

/**
 * Middleware to ensure user is authenticated (required authentication)
 * This is a shorthand for authenticate({ required: true })
 */
export const requireAuth = authenticate({ required: true });

/**
 * Middleware to optionally authenticate user (optional authentication)
 * This is a shorthand for authenticate({ required: false })
 */
export const optionalAuth = authenticate({ required: false });

/**
 * Middleware to verify refresh token
 * This is a shorthand for authenticate({ required: true, tokenType: 'refresh' })
 */
export const requireRefreshToken = authenticate({ 
  required: true, 
  tokenType: 'refresh' 
});

/**
 * Middleware to check if user owns a resource
 * @param resourceUserIdField - Field name containing the user ID in the resource
 * @returns Express middleware function
 */
export function requireOwnership(resourceUserIdField: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Ensure user is authenticated first
    if (!req.user || !req.userId) {
      res.status(401).json(
        createAuthErrorResponse('Authentication required', 'AUTH_REQUIRED')
      );
      return;
    }

    // Get the resource user ID from the request
    const resourceUserId = req.body?.[resourceUserIdField] || 
                          req.params?.[resourceUserIdField] || 
                          req.query?.[resourceUserIdField];

    if (!resourceUserId) {
      res.status(400).json(
        createAuthErrorResponse('Resource user ID not found', 'VALIDATION_ERROR')
      );
      return;
    }

    // Check if the authenticated user owns the resource
    if (req.userId !== resourceUserId) {
      logger.warn('Access denied - user does not own resource', {
        userId: req.userId,
        resourceUserId,
        path: req.path,
        method: req.method,
      });
      
      res.status(403).json(
        createAuthErrorResponse('Access denied', 'FORBIDDEN')
      );
      return;
    }

    next();
  };
}