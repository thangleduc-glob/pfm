/**
 * Expense report service for handling API calls
 * Manages communication with backend expense report endpoints
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiError } from '../types/category';

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
 * Expense category report data structure
 */
export interface ExpenseCategoryReport {
  categoryName: string;
  categoryId: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

/**
 * Complete expense report with grand total
 */
export interface ExpenseReport {
  categories: ExpenseCategoryReport[];
  grandTotal: number;
  totalTransactions: number;
  generatedAt: string;
}

/**
 * Expense report filters
 */
export interface ExpenseReportFilters {
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
}

/**
 * Expense report service class
 */
export class ExpenseReportService {
  /**
   * Generate expense report for the authenticated user
   * @param filters - Optional filters for the report
   * @returns Promise resolving to expense report data
   */
  async generateExpenseReport(filters?: ExpenseReportFilters): Promise<ExpenseReport> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      
      if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate);
      }
      
      if (filters?.categoryIds && filters.categoryIds.length > 0) {
        queryParams.append('categoryIds', filters.categoryIds.join(','));
      }

      const response = await api.get(
        `/reports/expenses?${queryParams.toString()}`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to generate expense report');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error(error.response.data.message || 'Invalid request parameters');
        } else if ((error.response?.status ?? 0) >= 500) {
          throw new Error('Server error. Please try again later');
        }
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to generate expense report');
    }
  }
}

// Export singleton instance
export const expenseReportService = new ExpenseReportService();