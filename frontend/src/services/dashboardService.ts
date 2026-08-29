/**
 * Dashboard service for API calls
 * Handles fetching dashboard financial summary data
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { DashboardData, DashboardResponse } from '../types/dashboard';

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
  (error: AxiosError) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

/**
 * Dashboard service class
 */
export class DashboardService {
  /**
   * Get dashboard financial summary for the authenticated user
   * @returns Promise<DashboardData> - The dashboard financial summary
   */
  static async getDashboardData(): Promise<DashboardData> {
    try {
      const response: AxiosResponse<DashboardResponse> = await api.get('/dashboard');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch dashboard data');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to fetch dashboard data: ${message}`);
      }
      throw error;
    }
  }
}

// Export a default instance for convenience
export default DashboardService;