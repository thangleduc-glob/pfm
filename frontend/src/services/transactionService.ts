/**
 * Transaction service for API calls
 * Handles CRUD operations for transactions
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionListResponse,
  TransactionFilters,
} from '../types/transaction';
import { Category, ApiError } from '../types/category';

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
 * Transaction service class
 */
export class TransactionService {
  /**
   * Get transactions with pagination and filtering
   * @param page - Page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @param filters - Optional filter criteria
   * @returns Promise resolving to transaction list response
   * @throws ApiError if request fails
   */
  static async getTransactions(
    page: number = 1,
    limit: number = 10,
    filters?: TransactionFilters
  ): Promise<TransactionListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filters to query params
      if (filters) {
        if (filters.type && filters.type !== 'all') {
          params.append('type', filters.type);
        }
        if (filters.categoryId) {
          params.append('categoryId', filters.categoryId);
        }
        if (filters.startDate) {
          params.append('startDate', filters.startDate);
        }
        if (filters.endDate) {
          params.append('endDate', filters.endDate);
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
      }

      const response = await api.get<TransactionListResponse>(`/transactions?${params}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to fetch transactions');
      }
      throw new Error('Network error while fetching transactions');
    }
  }

  /**
   * Create a new transaction
   * @param transactionData - Transaction creation data
   * @returns Promise resolving to created transaction
   * @throws ApiError if creation fails
   */
  static async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    try {
      const response = await api.post<Transaction>('/transactions', transactionData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to create transaction');
      }
      throw new Error('Network error while creating transaction');
    }
  }

  /**
   * Update an existing transaction
   * @param id - Transaction ID to update
   * @param transactionData - Transaction update data
   * @returns Promise resolving to updated transaction
   * @throws ApiError if update fails
   */
  static async updateTransaction(id: string, transactionData: UpdateTransactionRequest): Promise<Transaction> {
    try {
      const response = await api.put<Transaction>(`/transactions/${id}`, transactionData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to update transaction');
      }
      throw new Error('Network error while updating transaction');
    }
  }

  /**
   * Delete a transaction
   * @param id - Transaction ID to delete
   * @returns Promise resolving when transaction is deleted
   * @throws ApiError if deletion fails
   */
  static async deleteTransaction(id: string): Promise<void> {
    try {
      await api.delete(`/transactions/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to delete transaction');
      }
      throw new Error('Network error while deleting transaction');
    }
  }

  /**
   * Get a single transaction by ID
   * @param id - Transaction ID
   * @returns Promise resolving to transaction data
   * @throws ApiError if request fails
   */
  static async getTransaction(id: string): Promise<Transaction> {
    try {
      const response = await api.get<Transaction>(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to fetch transaction');
      }
      throw new Error('Network error while fetching transaction');
    }
  }

  /**
   * Get categories for transaction form
   * @param type - Optional type filter ('INCOME' | 'EXPENSE')
   * @returns Promise resolving to categories list
   * @throws ApiError if request fails
   */
  static async getCategories(type?: 'INCOME' | 'EXPENSE'): Promise<Category[]> {
    try {
      const params = type ? `?type=${type}` : '';
      const response = await api.get<{ categories: Category[] }>(`/categories${params}`);
      return response.data.categories;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to fetch categories');
      }
      throw new Error('Network error while fetching categories');
    }
  }
}

// Export default instance for convenience
export default TransactionService;