/**
 * Unit tests for AuthService
 * Tests authentication API calls and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoginRequest, RegisterRequest } from '../../types/auth';

// Mock axios before importing AuthService
const mockAxiosInstance = {
  post: vi.fn(),
  get: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

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

describe('AuthService', () => {
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
        data: {
          user: {
            id: '123',
            username: 'testuser',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Act
      const result = await AuthService.register(userData);

      // Assert
      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', userData);
    });

    it('should throw error when registration fails', async () => {
      // Arrange
      const userData: RegisterRequest = {
        username: 'testuser',
        password: 'password123',
      };
      
      const mockError = {
        response: {
          data: {
            error: 'Username already exists',
          },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(AuthService.register(userData)).rejects.toThrow('Username already exists');
    });

    it('should throw network error when request fails', async () => {
      // Arrange
      const userData: RegisterRequest = {
        username: 'testuser',
        password: 'password123',
      };

      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(AuthService.register(userData)).rejects.toThrow('Network error during registration');
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
        data: {
          user: {
            id: '123',
            username: 'testuser',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Act
      const result = await AuthService.login(credentials);

      // Assert
      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
    });

    it('should throw error when login fails', async () => {
      // Arrange
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
      };
      
      const mockError = {
        response: {
          data: {
            error: 'Invalid username or password',
          },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(AuthService.login(credentials)).rejects.toThrow('Invalid username or password');
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      // Arrange
      mockAxiosInstance.post.mockResolvedValue({});

      // Act & Assert
      await expect(AuthService.logout()).resolves.not.toThrow();
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should handle logout errors gracefully', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockAxiosInstance.post.mockRejectedValue(new Error('Logout failed'));

      // Act & Assert
      await expect(AuthService.logout()).resolves.not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Logout request failed:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('getProfile', () => {
    it('should successfully get user profile', async () => {
      // Arrange
      const mockResponse = {
        data: {
          user: {
            id: '123',
            username: 'testuser',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Act
      const result = await AuthService.getProfile();

      // Assert
      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/profile');
    });

    it('should throw error when getting profile fails', async () => {
      // Arrange
      const mockError = {
        response: {
          data: {
            error: 'Unauthorized',
          },
        },
      };

      mockAxiosInstance.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(AuthService.getProfile()).rejects.toThrow('Unauthorized');
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      // Arrange
      mockAxiosInstance.post.mockResolvedValue({});

      // Act & Assert
      await expect(AuthService.refreshToken()).resolves.not.toThrow();
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/refresh');
    });

    it('should throw error when token refresh fails', async () => {
      // Arrange
      const mockError = {
        response: {
          data: {
            error: 'Token expired',
          },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(AuthService.refreshToken()).rejects.toThrow('Token expired');
    });
  });

  describe('axios interceptors', () => {
    it('should set up request interceptor', () => {
      // Act
      AuthService.register({ username: 'test', password: 'test' });

      // Assert
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });

    it('should set up response interceptor', () => {
      // Act
      AuthService.register({ username: 'test', password: 'test' });

      // Assert
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should redirect to login on 401 response', async () => {
      // Arrange
      const mockError = {
        response: {
          status: 401,
        },
      };

      // Get the response interceptor handler
      const responseInterceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const onRejected = responseInterceptorCall[1];

      // Act
      await onRejected(mockError);

      // Assert
      expect(mockLocation.href).toBe('/login');
    });
  });
});