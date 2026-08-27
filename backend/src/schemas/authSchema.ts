/**
 * Authentication schemas for request/response validation
 * Uses Zod for runtime type validation and TypeScript inference
 */

import { z } from 'zod';
import { loginSchema, registerSchema } from '../utils/validation';

/**
 * Authentication request schemas
 */

/** Login request payload schema */
export const loginRequestSchema = loginSchema;

/** Registration request payload schema */
export const registerRequestSchema = registerSchema;

/** Refresh token request schema */
export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/** Logout request schema */
export const logoutRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

/**
 * Authentication response schemas
 */

/** User response schema (without sensitive data) */
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** Authentication success response schema */
export const authResponseSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

/** Token validation response schema */
export const tokenValidationResponseSchema = z.object({
  valid: z.boolean(),
  userId: z.string().optional(),
  username: z.string().optional(),
  error: z.string().optional(),
});

/**
 * JWT payload schemas
 */

/** JWT access token payload schema */
export const accessTokenPayloadSchema = z.object({
  userId: z.string().uuid(),
  username: z.string(),
  type: z.literal('access'),
  iat: z.number(),
  exp: z.number(),
});

/** JWT refresh token payload schema */
export const refreshTokenPayloadSchema = z.object({
  userId: z.string().uuid(),
  username: z.string(),
  type: z.literal('refresh'),
  iat: z.number(),
  exp: z.number(),
});

/** Generic JWT token payload schema */
export const jwtPayloadSchema = z.union([
  accessTokenPayloadSchema,
  refreshTokenPayloadSchema,
]);

/**
 * Error response schemas
 */

/** Authentication error response schema */
export const authErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.enum([
    'INVALID_CREDENTIALS',
    'USER_NOT_FOUND',
    'USERNAME_EXISTS',
    'TOKEN_EXPIRED',
    'TOKEN_INVALID',
    'VALIDATION_ERROR',
    'INTERNAL_ERROR',
  ]),
});

/**
 * Configuration schemas
 */

/** JWT configuration schema */
export const jwtConfigSchema = z.object({
  secret: z.string().min(32, 'JWT secret must be at least 32 characters'),
  accessTokenExpiresIn: z.string(),
  refreshTokenExpiresIn: z.string(),
});

/** Password configuration schema */
export const passwordConfigSchema = z.object({
  minLength: z.number().min(8),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  maxAttempts: z.number().min(3),
  lockoutDuration: z.number().min(300000), // 5 minutes in ms
});

/**
 * Type exports inferred from schemas
 */

/** Login request type */
export type LoginRequest = z.infer<typeof loginRequestSchema>;

/** Registration request type */
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

/** Refresh token request type */
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;

/** Logout request type */
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;

/** User response type */
export type UserResponse = z.infer<typeof userResponseSchema>;

/** Authentication response type */
export type AuthResponse = z.infer<typeof authResponseSchema>;

/** Token validation response type */
export type TokenValidationResponse = z.infer<typeof tokenValidationResponseSchema>;

/** JWT access token payload type */
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

/** JWT refresh token payload type */
export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;

/** JWT token payload type */
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

/** Authentication error response type */
export type AuthErrorResponse = z.infer<typeof authErrorResponseSchema>;

/** JWT configuration type */
export type JwtConfig = z.infer<typeof jwtConfigSchema>;

/** Password configuration type */
export type PasswordConfig = z.infer<typeof passwordConfigSchema>;

/**
 * Validation functions
 */

/**
 * Validate login request data
 * @param data - Raw login request data
 * @returns Validated login request
 */
export function validateLoginRequest(data: unknown): LoginRequest {
  return loginRequestSchema.parse(data);
}

/**
 * Validate registration request data
 * @param data - Raw registration request data
 * @returns Validated registration request
 */
export function validateRegisterRequest(data: unknown): RegisterRequest {
  return registerRequestSchema.parse(data);
}

/**
 * Validate refresh token request data
 * @param data - Raw refresh token request data
 * @returns Validated refresh token request
 */
export function validateRefreshTokenRequest(data: unknown): RefreshTokenRequest {
  return refreshTokenRequestSchema.parse(data);
}

/**
 * Validate logout request data
 * @param data - Raw logout request data
 * @returns Validated logout request
 */
export function validateLogoutRequest(data: unknown): LogoutRequest {
  return logoutRequestSchema.parse(data);
}

/**
 * Validate JWT payload
 * @param payload - Raw JWT payload
 * @returns Validated JWT payload
 */
export function validateJwtPayload(payload: unknown): JwtPayload {
  return jwtPayloadSchema.parse(payload);
}

/**
 * Create a standardized authentication error response
 * @param message - Error message
 * @param code - Error code
 * @returns Authentication error response
 */
export function createAuthErrorResponse(
  message: string,
  code: AuthErrorResponse['code']
): AuthErrorResponse {
  return {
    error: 'Authentication Error',
    message,
    code,
  };
}