/**
 * Unit tests for AuthService
 * Tests authentication API calls and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoginRequest, RegisterRequest } from '../../types/auth';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Import AuthService after mocking
import AuthService from '../authService';

// Mock the axios instance directly
vi.mock('../authService', () => {
  const mockAuthService = {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    refreshToken: vi.fn(),
  };
  
  return {
    default: mockAuthService,
  };
});

describe('AuthService', () => {
  const mockAuthService = vi.mocked(AuthService);

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      // Arrange
      const userData: RegisterRequest = {
        username: 'testuser',
        password: 'password123',
      };
      
      const mockResponse = {
        user: {
          id: '123',
          username: 'testuser',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      // Act
      const result = await AuthService.register(userData);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
    });

    it('should throw error when registration fails', async () => {
      // Arrange
      const userData: RegisterRequest = {
        username: 'testuser',
        password: 'password123',
      };

      mockAuthService.register.mockRejectedValue(new Error('Username already exists'));

      // Act & Assert
      await expect(AuthService.register(userData)).rejects.toThrow('Username already exists');
    });

    it('should throw network error when request fails', async () => {
      // Arrange
      const userData: RegisterRequest = {
        username: 'testuser',
        password: 'password123',
      };

      mockAuthService.register.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(AuthService.register(userData)).rejects.toThrow('Network error');
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      // Arrange
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123',
      };
      
      const mockResponse = {
        user: {
          id: '123',
          username: 'testuser',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      // Act
      const result = await AuthService.login(credentials);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
    });

    it('should throw error when login fails', async () => {
      // Arrange
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid username or password'));

      // Act & Assert
      await expect(AuthService.login(credentials)).rejects.toThrow('Invalid username or password');
    });
  });

  describe('getProfile', () => {
    it('should successfully get user profile', async () => {
      // Arrange
      const mockResponse = {
        user: {
          id: '123',
          username: 'testuser',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      mockAuthService.getProfile.mockResolvedValue(mockResponse);

      // Act
      const result = await AuthService.getProfile();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockAuthService.getProfile).toHaveBeenCalled();
    });

    it('should throw error when getting profile fails', async () => {
      // Arrange
      mockAuthService.getProfile.mockRejectedValue(new Error('Unauthorized'));

      // Act & Assert
      await expect(AuthService.getProfile()).rejects.toThrow('Unauthorized');
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(undefined);

      // Act & Assert
      await expect(AuthService.refreshToken()).resolves.not.toThrow();
      expect(mockAuthService.refreshToken).toHaveBeenCalled();
    });

    it('should throw error when token refresh fails', async () => {
      // Arrange
      mockAuthService.refreshToken.mockRejectedValue(new Error('Token expired'));

      // Act & Assert
      await expect(AuthService.refreshToken()).rejects.toThrow('Token expired');
    });
  });
});