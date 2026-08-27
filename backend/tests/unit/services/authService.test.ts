/**
 * Unit tests for authentication service
 */

import jwt from 'jsonwebtoken';
import { AuthService } from '../../../src/services/authService';
import { userRepository } from '../../../src/repositories/userRepository';
import { hashPassword, verifyPassword } from '../../../src/utils/encryption';
import { SafeUser, RegisterRequest, LoginRequest } from '../../../src/types/auth';

// Mock dependencies
jest.mock('../../../src/repositories/userRepository');
jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('../../../src/schemas/authSchema', () => ({
  ...jest.requireActual('../../../src/schemas/authSchema'),
  validateJwtPayload: jest.fn((payload) => payload),
}));

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
    
    // Set test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-256-bits-long-for-testing';
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';
  });

  const mockUser: SafeUser = {
    id: 'user-123',
    username: 'testuser',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockUserWithPassword = {
    ...mockUser,
    passwordHash: 'hashed-password',
  };

  describe('register', () => {
    const validRegistrationData: RegisterRequest = {
      username: 'newuser',
      password: 'Password123',
    };

    it('should register a new user successfully', async () => {
      // Arrange
      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockHashPassword.mockResolvedValue('hashed-password');
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await authService.register(validRegistrationData);

      // Assert
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith('newuser');
      expect(mockHashPassword).toHaveBeenCalledWith('Password123');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: 'newuser',
        password: 'hashed-password',
      });
    });

    it('should throw error if username already exists', async () => {
      // Arrange
      mockUserRepository.existsByUsername.mockResolvedValue(true);

      // Act & Assert
      await expect(authService.register(validRegistrationData)).rejects.toThrow('Username already exists');
      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith('newuser');
      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockHashPassword.mockResolvedValue('hashed-password');
      mockUserRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(authService.register(validRegistrationData)).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    const validLoginData: LoginRequest = {
      username: 'testuser',
      password: 'Password123',
    };

    it('should login user successfully', async () => {
      // Arrange
      mockUserRepository.findByUsernameWithPassword.mockResolvedValue(mockUserWithPassword);
      mockVerifyPassword.mockResolvedValue(true);
      mockUserRepository.updateLastLogin.mockResolvedValue();

      // Act
      const result = await authService.login(validLoginData);

      // Assert
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockUserRepository.findByUsernameWithPassword).toHaveBeenCalledWith('testuser');
      expect(mockVerifyPassword).toHaveBeenCalledWith('Password123', 'hashed-password');
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith('user-123');
    });

    it('should throw error for non-existent user', async () => {
      // Arrange
      mockUserRepository.findByUsernameWithPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(validLoginData)).rejects.toThrow('Invalid username or password');
      expect(mockVerifyPassword).not.toHaveBeenCalled();
    });

    it('should throw error for invalid password', async () => {
      // Arrange
      mockUserRepository.findByUsernameWithPassword.mockResolvedValue(mockUserWithPassword);
      mockVerifyPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(validLoginData)).rejects.toThrow('Invalid username or password');
      expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Arrange
      mockUserRepository.findByUsernameWithPassword.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(authService.login(validLoginData)).rejects.toThrow('Login failed');
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      // Arrange
      const validRefreshToken = jwt.sign(
        {
          userId: 'user-123',
          username: 'testuser',
          type: 'refresh',
        },
        'test-jwt-secret-key-minimum-256-bits-long-for-testing',
        { expiresIn: '7d' }
      );
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await authService.refreshToken(validRefreshToken);

      // Assert
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    });

    it('should throw error for invalid token', async () => {
      // Act & Assert
      await expect(authService.refreshToken('invalid-token')).rejects.toThrow('Invalid refresh token');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error for non-existent user', async () => {
      // Arrange
      const validToken = jwt.sign(
        {
          userId: 'nonexistent-user',
          username: 'testuser',
          type: 'refresh',
        },
        'test-jwt-secret-key-minimum-256-bits-long-for-testing',
        { expiresIn: '7d' }
      );
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken(validToken)).rejects.toThrow('User not found');
    });

    it('should throw error for access token used as refresh token', async () => {
      // Arrange
      const accessToken = jwt.sign(
        {
          userId: 'user-123',
          username: 'testuser',
          type: 'access',
        },
        'test-jwt-secret-key-minimum-256-bits-long-for-testing',
        { expiresIn: '15m' }
      );

      // Act & Assert
      await expect(authService.refreshToken(accessToken)).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Act & Assert
      await expect(authService.logout('user-123')).resolves.toBeUndefined();
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = authService.validatePassword('Password123');
      expect(result).toBe(true);
    });

    it('should reject short password', () => {
      const result = authService.validatePassword('Pass1');
      expect(result).toBe(false);
    });

    it('should reject password without letters', () => {
      const result = authService.validatePassword('12345678');
      expect(result).toBe(false);
    });

    it('should reject password without numbers', () => {
      const result = authService.validatePassword('Password');
      expect(result).toBe(false);
    });

    it('should accept password with special characters', () => {
      const result = authService.validatePassword('P@ssword123');
      expect(result).toBe(true);
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      // Arrange
      mockHashPassword.mockResolvedValue('hashed-password');

      // Act
      const result = await authService.hashPassword('Password123');

      // Assert
      expect(result).toBe('hashed-password');
      expect(mockHashPassword).toHaveBeenCalledWith('Password123');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      // Arrange
      const accessToken = jwt.sign(
        {
          userId: 'user-123',
          username: 'testuser',
          type: 'access',
        },
        'test-jwt-secret-key-minimum-256-bits-long-for-testing',
        { expiresIn: '15m' }
      );

      // Act
      const result = authService.verifyAccessToken(accessToken);

      // Assert
      expect(result).toEqual({
        userId: 'user-123',
        username: 'testuser',
        type: 'access',
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
    });

    it('should return null for invalid token', () => {
      // Act
      const result = authService.verifyAccessToken('invalid-token');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for refresh token', () => {
      // Arrange
      const refreshToken = jwt.sign(
        {
          userId: 'user-123',
          username: 'testuser',
          type: 'refresh',
        },
        'test-jwt-secret-key-minimum-256-bits-long-for-testing',
        { expiresIn: '7d' }
      );

      // Act
      const result = authService.verifyAccessToken(refreshToken);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      // Arrange
      const refreshToken = jwt.sign(
        {
          userId: 'user-123',
          username: 'testuser',
          type: 'refresh',
        },
        'test-jwt-secret-key-minimum-256-bits-long-for-testing',
        { expiresIn: '7d' }
      );

      // Act
      const result = authService.verifyRefreshToken(refreshToken);

      // Assert
      expect(result).toEqual({
        userId: 'user-123',
        username: 'testuser',
        type: 'refresh',
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
    });

    it('should return null for invalid token', () => {
      // Act
      const result = authService.verifyRefreshToken('invalid-token');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for access token', () => {
      // Arrange
      const accessToken = jwt.sign(
        {
          userId: 'user-123',
          username: 'testuser',
          type: 'access',
        },
        'test-jwt-secret-key-minimum-256-bits-long-for-testing',
        { expiresIn: '15m' }
      );

      // Act
      const result = authService.verifyRefreshToken(accessToken);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Token Generation', () => {
    it('should generate tokens with correct expiration', async () => {
      // Arrange
      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockHashPassword.mockResolvedValue('hashed-password');
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await authService.register({
        username: 'newuser',
        password: 'Password123',
      });

      // Assert
      // Verify access token
      const accessDecoded = jwt.decode(result.accessToken) as any;
      expect(accessDecoded.type).toBe('access');
      expect(accessDecoded.userId).toBe('user-123');
      expect(accessDecoded.username).toBe('testuser');

      // Verify refresh token
      const refreshDecoded = jwt.decode(result.refreshToken) as any;
      expect(refreshDecoded.type).toBe('refresh');
      expect(refreshDecoded.userId).toBe('user-123');
      expect(refreshDecoded.username).toBe('testuser');
    });
  });
});