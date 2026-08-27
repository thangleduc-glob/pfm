/**
 * Authentication-related type definitions for the backend
 * These types define the shape of authentication data and internal interfaces
 */

import { User } from '@prisma/client';

/** User data without sensitive information */
export type SafeUser = Omit<User, 'password'>;

/** Login request payload */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Registration request payload */
export interface RegisterRequest {
  username: string;
  password: string;
}

/** Authentication result with tokens */
export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

/** JWT payload structure */
export interface JwtPayload {
  userId: string;
  username: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

/** Authentication service interface */
export interface IAuthService {
  register(userData: RegisterRequest): Promise<AuthResult>;
  login(credentials: LoginRequest): Promise<AuthResult>;
  refreshToken(token: string): Promise<AuthResult>;
  logout(userId: string): Promise<void>;
  validatePassword(password: string): boolean;
  hashPassword(password: string): Promise<string>;
}

/** Database user service interface */
export interface IUserService {
  findById(id: string): Promise<SafeUser | null>;
  findByUsername(username: string): Promise<SafeUser | null>;
  create(userData: RegisterRequest): Promise<SafeUser>;
  existsByUsername(username: string): Promise<boolean>;
}

/** Request context with authenticated user */
export interface AuthenticatedRequest {
  user: SafeUser;
  userId: string;
}

/** Authentication middleware options */
export interface AuthMiddlewareOptions {
  required?: boolean;
  tokenType?: 'access' | 'refresh';
}