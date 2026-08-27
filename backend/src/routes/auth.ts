/**
 * Authentication routes
 * Defines all authentication-related API endpoints
 */

import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
} from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import {
  loginRequestSchema,
  registerRequestSchema,
  refreshTokenRequestSchema,
} from '../schemas/authSchema';

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  validateRequest(registerRequestSchema),
  register
);

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticate user and get tokens
 * @access Public
 */
router.post(
  '/login',
  validateRequest(loginRequestSchema),
  login
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user and clear cookies
 * @access Private
 */
router.post(
  '/logout',
  authenticate,
  logout
);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 * @access Public (requires valid refresh token)
 */
router.post(
  '/refresh',
  validateRequest(refreshTokenRequestSchema),
  refreshToken
);

/**
 * @route GET /api/v1/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get(
  '/profile',
  authenticate,
  getProfile
);

export { router as authRoutes };