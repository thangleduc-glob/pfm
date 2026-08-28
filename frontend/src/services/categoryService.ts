/**
 * Category service for API calls
 * Handles CRUD operations for categories
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListResponse,
  ApiError
} from '../types/category';

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
 * Category service class
 */
export class CategoryService {
  /**
   * Get all categories for the current user
   * @returns Promise resolving to category list response
   * @throws ApiError if request fails
   */
  static async getCategories(): Promise<CategoryListResponse> {
    try {
      const response = await api.get<CategoryListResponse>('/categories');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to fetch categories');
      }
      throw new Error('Network error while fetching categories');
    }
  }

  /**
   * Create a new category
   * @param categoryData - Category creation data
   * @returns Promise resolving to created category
   * @throws ApiError if creation fails
   */
  static async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await api.post<Category>('/categories', categoryData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to create category');
      }
      throw new Error('Network error while creating category');
    }
  }

  /**
   * Update an existing category
   * @param id - Category ID to update
   * @param categoryData - Category update data
   * @returns Promise resolving to updated category
   * @throws ApiError if update fails
   */
  static async updateCategory(id: string, categoryData: UpdateCategoryRequest): Promise<Category> {
    try {
      const response = await api.put<Category>(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to update category');
      }
      throw new Error('Network error while updating category');
    }
  }

  /**
   * Delete a category
   * @param id - Category ID to delete
   * @returns Promise resolving when category is deleted
   * @throws ApiError if deletion fails
   */
  static async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to delete category');
      }
      throw new Error('Network error while deleting category');
    }
  }

  /**
   * Get a single category by ID
   * @param id - Category ID
   * @returns Promise resolving to category data
   * @throws ApiError if request fails
   */
  static async getCategory(id: string): Promise<Category> {
    try {
      const response = await api.get<Category>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to fetch category');
      }
      throw new Error('Network error while fetching category');
    }
  }
}

// Export default instance for convenience
export default CategoryService;