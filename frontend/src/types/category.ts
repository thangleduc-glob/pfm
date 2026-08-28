/**
 * Category-related type definitions for the frontend
 * These types define the shape of category data and API responses
 */

/** Base category interface */
export interface BaseCategory {
  name: string;
  type: 'income' | 'expense';
}

/** Category entity with database fields */
export interface Category extends BaseCategory {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/** Category creation request payload */
export interface CreateCategoryRequest extends BaseCategory {}

/** Category update request payload */
export interface UpdateCategoryRequest extends BaseCategory {}

/** Category list response */
export interface CategoryListResponse {
  categories: Category[];
}

/** Category validation errors */
export interface CategoryValidationError {
  name?: string;
  type?: string;
}

/** Category with transaction count (for UI display) */
export interface CategoryWithCount extends Category {
  transactionCount: number;
}

/** Category summary for reports */
export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  type: 'income' | 'expense';
  totalAmount: number;
  transactionCount: number;
}

/** API error response */
export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}