/**
 * Authentication service implementation
 * Handles user registration, login, token management, and password validation
 */

import jwt from 'jsonwebtoken';
import { 
  AuthResult, 
  LoginRequest, 
  RegisterRequest, 
  IAuthService,
  JwtPayload,
  SafeUser
} from '../types/auth';
import { userRepository } from '../repositories/userRepository';
import { hashPassword, verifyPassword } from '../utils/encryption';
import { logger } from '../utils/logger';
import { 
  validateLoginRequest,
  validateRegisterRequest,
  validateJwtPayload,
  JwtConfig
} from '../schemas/authSchema';

/**
 * Authentication service implementation
 */
export class AuthService implements IAuthService {
  private jwtConfig: JwtConfig;

  constructor() {
    // Validate and set JWT configuration from environment
    this.jwtConfig = {
      secret: process.env.JWT_SECRET || 'fallback-secret-key-for-development-only',
      accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
      refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
    };

    if (this.jwtConfig.secret === 'fallback-secret-key-for-development-only') {
      logger.warn('Using fallback JWT secret - please set JWT_SECRET in production');
    }
  }

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise<AuthResult> - Authentication result with tokens
   */
  async register(userData: RegisterRequest): Promise<AuthResult> {
    try {
      // Validate input data
      const validatedData = validateRegisterRequest(userData);
      
      // Check if username already exists
      const existingUser = await userRepository.existsByUsername(validatedData.username);
      if (existingUser) {
        logger.warn('Registration attempt with existing username', { 
          username: validatedData.username 
        });
        throw new Error('Username already exists');
      }

      // Hash the password
      const passwordHash = await hashPassword(validatedData.password);

      // Create user with hashed password
      const user = await userRepository.create({
        username: validatedData.username,
        password: passwordHash,
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info('User registered successfully', { 
        userId: user.id, 
        username: user.username 
      });

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Username already exists') {
        throw error;
      }

      logger.error('Registration failed', { 
        username: userData.username,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error('Registration failed');
    }
  }

  /**
   * Authenticate user and generate tokens
   * @param credentials - Login credentials
   * @returns Promise<AuthResult> - Authentication result with tokens
   */
  async login(credentials: LoginRequest): Promise<AuthResult> {
    try {
      // Validate input data
      const validatedCredentials = validateLoginRequest(credentials);

      // Find user with password
      const userWithPassword = await userRepository.findByUsernameWithPassword(
        validatedCredentials.username
      );

      if (!userWithPassword) {
        logger.warn('Login attempt with non-existent username', { 
          username: validatedCredentials.username 
        });
        throw new Error('Invalid username or password');
      }

      // Verify password
      const isPasswordValid = await verifyPassword(
        validatedCredentials.password,
        userWithPassword.passwordHash
      );

      if (!isPasswordValid) {
        logger.warn('Login attempt with invalid password', { 
          username: validatedCredentials.username 
        });
        throw new Error('Invalid username or password');
      }

      // Create safe user object (without password)
      const safeUser: SafeUser = {
        id: userWithPassword.id,
        username: userWithPassword.username,
        createdAt: userWithPassword.createdAt,
        updatedAt: userWithPassword.updatedAt,
      };

      // Generate tokens
      const tokens = await this.generateTokens(safeUser);

      // Update last login
      await userRepository.updateLastLogin(safeUser.id);

      logger.info('User logged in successfully', { 
        userId: safeUser.id, 
        username: safeUser.username 
      });

      return {
        user: safeUser,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof Error && 
          (error.message === 'Invalid username or password' || 
           error.message === 'Username already exists')) {
        throw error;
      }

      logger.error('Login failed', { 
        username: credentials.username,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error('Login failed');
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken - The refresh token
   * @returns Promise<AuthResult> - New authentication result with fresh tokens
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Verify and decode refresh token
      const payload = this.verifyToken(refreshToken, 'refresh');
      
      if (!payload) {
        throw new Error('Invalid refresh token');
      }

      // Find user
      const user = await userRepository.findById(payload.userId);
      if (!user) {
        logger.warn('Refresh token for non-existent user', { userId: payload.userId });
        throw new Error('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      logger.info('Token refreshed successfully', { 
        userId: user.id, 
        username: user.username 
      });

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof Error && 
          (error.message === 'Invalid refresh token' || 
           error.message === 'User not found')) {
        throw error;
      }

      logger.error('Token refresh failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Logout user (invalidate tokens)
   * @param userId - The user ID to logout
   * @returns Promise<void>
   */
  async logout(userId: string): Promise<void> {
    try {
      // In a stateless JWT implementation, we can't directly invalidate tokens
      // This would typically be handled by a token blacklist or short token expiry
      // For now, we'll just log the logout event
      logger.info('User logged out', { userId });
      
      // TODO: Implement token blacklist if needed
      // await tokenBlacklistService.addTokenToBlacklist(token);
    } catch (error) {
      logger.error('Logout failed', { 
        userId,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error('Logout failed');
    }
  }

  /**
   * Validate password strength
   * @param password - The password to validate
   * @returns boolean - True if password meets requirements
   */
  validatePassword(password: string): boolean {
    // Password must be at least 8 characters
    if (password.length < 8) {
      return false;
    }

    // Password must contain at least one letter
    if (!/[A-Za-z]/.test(password)) {
      return false;
    }

    // Password must contain at least one number
    if (!/\d/.test(password)) {
      return false;
    }

    return true;
  }

  /**
   * Hash a password (wrapper for encryption utility)
   * @param password - The password to hash
   * @returns Promise<string> - The hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  }

  /**
   * Generate JWT tokens for a user
   * @param user - The user to generate tokens for
   * @returns Promise<{ accessToken: string, refreshToken: string }>
   */
  private async generateTokens(user: SafeUser): Promise<{ accessToken: string, refreshToken: string }> {
    // Access token payload (15 minutes)
    const accessTokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      username: user.username,
      type: 'access',
    };

    // Refresh token payload (7 days)
    const refreshTokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      username: user.username,
      type: 'refresh',
    };

    // Generate tokens
    const accessToken = jwt.sign(accessTokenPayload, this.jwtConfig.secret, {
      expiresIn: this.jwtConfig.accessTokenExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(refreshTokenPayload, this.jwtConfig.secret, {
      expiresIn: this.jwtConfig.refreshTokenExpiresIn,
    } as jwt.SignOptions);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify and decode a JWT token
   * @param token - The token to verify
   * @param expectedType - Expected token type ('access' or 'refresh')
   * @returns JwtPayload | null - The decoded payload or null if invalid
   */
  private verifyToken(token: string, expectedType: 'access' | 'refresh'): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtConfig.secret) as any;
      
      // Validate the decoded payload
      const payload = validateJwtPayload(decoded);
      
      // Check token type matches expected type
      if (payload.type !== expectedType) {
        logger.warn('Token type mismatch', { 
          expectedType, 
          actualType: payload.type 
        });
        return null;
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.debug('Token expired', { error: error.message });
        return null;
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        logger.debug('Invalid token', { error: error.message });
        return null;
      }

      logger.error('Token verification error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }

  /**
   * Verify access token (for middleware)
   * @param token - The access token to verify
   * @returns JwtPayload | null - The decoded payload or null if invalid
   */
  public verifyAccessToken(token: string): JwtPayload | null {
    return this.verifyToken(token, 'access');
  }

  /**
   * Verify refresh token (for token refresh)
   * @param token - The refresh token to verify
   * @returns JwtPayload | null - The decoded payload or null if invalid
   */
  public verifyRefreshToken(token: string): JwtPayload | null {
    return this.verifyToken(token, 'refresh');
  }
}

// Export singleton instance
export const authService = new AuthService();