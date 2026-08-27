/**
 * Authentication service for API calls
 * Handles login, register, and logout operations
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse, ApiError } from '../types/auth';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  withCredentials: true, // Important for HttpOnly cookies
});

/**
 * Request interceptor to add common headers
 */
api.interceptors.request.use(
  (config) => {
    // Add any common headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle common errors
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication service class
 */
export class AuthService {
  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise resolving to auth response
   * @throws ApiError if registration fails
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Registration failed');
      }
      throw new Error('Network error during registration');
    }
  }

  /**
   * Login user
   * @param credentials - User login credentials
   * @returns Promise resolving to auth response
   * @throws ApiError if login fails
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Login failed');
      }
      throw new Error('Network error during login');
    }
  }

  /**
   * Logout user
   * @returns Promise resolving when logout is complete
   * @throws ApiError if logout fails
   */
  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we should clear local state
      console.warn('Logout request failed:', error);
    }
  }

  /**
   * Get current user profile
   * @returns Promise resolving to user data
   * @throws ApiError if request fails
   */
  static async getProfile(): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>('/auth/profile');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to get profile');
      }
      throw new Error('Network error while getting profile');
    }
  }

  /**
   * Refresh access token
   * @returns Promise resolving when token is refreshed
   * @throws ApiError if refresh fails
   */
  static async refreshToken(): Promise<void> {
    try {
      await api.post('/auth/refresh');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Token refresh failed');
      }
      throw new Error('Network error during token refresh');
    }
  }
}

// Export default instance for convenience
export default AuthService;