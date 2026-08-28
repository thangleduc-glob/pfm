/**
 * Category schemas for request/response validation
 * Uses Zod for runtime type validation and TypeScript inference
 */

import { z } from 'zod';
import { categoryTypeSchema } from '../utils/validation';

/**
 * Category request schemas
 */

/** Create category request payload schema */
export const createCategoryRequestSchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be 50 characters or less')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Category name can only contain letters, numbers, spaces, hyphens, and underscores'),
  type: categoryTypeSchema,
});

/** Update category request payload schema */
export const updateCategoryRequestSchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be 50 characters or less')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Category name can only contain letters, numbers, spaces, hyphens, and underscores'),
  type: categoryTypeSchema,
});

/** Category ID parameter schema */
export const categoryIdParamSchema = z.object({
  id: z.string().uuid('Invalid category ID format'),
});

/**
 * Category response schemas
 */

/** Category response schema */
export const categoryResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  type: z.enum(['INCOME', 'EXPENSE']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** Category list response schema */
export const categoryListResponseSchema = z.array(categoryResponseSchema);

/** Category with transaction count response schema */
export const categoryWithTransactionCountResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  type: z.enum(['INCOME', 'EXPENSE']),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z.object({
    transactions: z.number(),
  }),
});

/**
 * Category validation error schemas
 */

/** Category already exists error schema */
export const categoryAlreadyExistsErrorSchema = z.object({
  error: z.string(),
  code: z.literal('DUPLICATE_CATEGORY'),
  timestamp: z.date(),
  path: z.string(),
  method: z.string(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })),
});

/** Category not found error schema */
export const categoryNotFoundErrorSchema = z.object({
  error: z.string(),
  code: z.literal('CATEGORY_NOT_FOUND'),
  timestamp: z.date(),
  path: z.string(),
  method: z.string(),
});

/** Category has transactions error schema */
export const categoryHasTransactionsErrorSchema = z.object({
  error: z.string(),
  code: z.literal('CATEGORY_HAS_TRANSACTIONS'),
  timestamp: z.date(),
  path: z.string(),
  method: z.string(),
});

/**
 * Type inference
 */
export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategoryRequestSchema>;
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
export type CategoryListResponse = z.infer<typeof categoryListResponseSchema>;
export type CategoryWithTransactionCountResponse = z.infer<typeof categoryWithTransactionCountResponseSchema>;