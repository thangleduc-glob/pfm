/**
 * Category-related type definitions for the backend
 * These types define the shape of category data and internal interfaces
 */

import { Category } from '@prisma/client';

/** Base category interface */
export interface BaseCategory {
  name: string;
  type: 'income' | 'expense';
}

/** Category creation request payload */
export interface CreateCategoryRequest extends BaseCategory {}

/** Category update request payload */
export interface UpdateCategoryRequest extends BaseCategory {}

/** Category with user information */
export interface CategoryWithUser extends Category {
  user: {
    id: string;
    username: string;
  };
}

/** Category with transaction count */
export interface CategoryWithTransactionCount extends Category {
  _count: {
    transactions: number;
  };
}

/** Category service interface */
export interface ICategoryService {
  create(userId: string, data: CreateCategoryRequest): Promise<Category>;
  findById(id: string, userId: string): Promise<Category | null>;
  findByUser(userId: string): Promise<Category[]>;
  update(id: string, userId: string, data: UpdateCategoryRequest): Promise<Category>;
  delete(id: string, userId: string): Promise<void>;
  existsByName(userId: string, name: string, type: 'income' | 'expense'): Promise<boolean>;
  existsByNameForUpdate(id: string, userId: string, name: string, type: 'income' | 'expense'): Promise<boolean>;
  hasTransactions(id: string, userId: string): Promise<boolean>;
}

/** Category repository interface */
export interface ICategoryRepository {
  create(data: CreateCategoryRequest & { userId: string }): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByUserId(userId: string): Promise<Category[]>;
  update(id: string, data: UpdateCategoryRequest): Promise<Category>;
  delete(id: string): Promise<void>;
  countTransactions(id: string): Promise<number>;
  findByNameAndType(userId: string, name: string, type: 'income' | 'expense'): Promise<Category | null>;
  findByNameAndTypeExcludingId(id: string, userId: string, name: string, type: 'income' | 'expense'): Promise<Category | null>;
}