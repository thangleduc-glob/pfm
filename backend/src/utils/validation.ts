/**
 * Validation utilities for backend request validation
 * Implements business rules from the specification
 */

import { z } from 'zod';

/** Common validation patterns */
export const VALIDATION_PATTERNS = {
  username: /^[a-zA-Z0-9_]{3,50}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  categoryName: /^.{1,50}$/,
  note: /^.{0,255}$/,
  amount: /^(?!0\d)\d+(\.\d{1,2})?$/,
  date: /^\d{4}-\d{2}-\d{2}$/
} as const;

/** Zod schemas for validation */

/** Username validation schema */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(50, 'Username must be 50 characters or less')
  .regex(VALIDATION_PATTERNS.username, 'Username can only contain letters, numbers, and underscores');

/** Password validation schema */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(VALIDATION_PATTERNS.password, 'Password must contain at least one letter and one number');

/** Login request schema */
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

/** Registration request schema */
export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema
});

/** Category type validation */
export const categoryTypeSchema = z.enum(['income', 'expense'], {
  errorMap: () => ({ message: 'Category type must be either income or expense' })
});

/** Category name schema */
export const categoryNameSchema = z
  .string()
  .min(1, 'Category name is required')
  .max(50, 'Category name must be 50 characters or less')
  .regex(VALIDATION_PATTERNS.categoryName, 'Category name contains invalid characters');

/** Create category request schema */
export const createCategorySchema = z.object({
  name: categoryNameSchema,
  type: categoryTypeSchema
});

/** Update category request schema */
export const updateCategorySchema = z.object({
  name: categoryNameSchema,
  type: categoryTypeSchema
});

/** Amount validation schema */
export const amountSchema = z
  .string()
  .or(z.number())
  .transform((val) => typeof val === 'string' ? parseFloat(val) : val)
  .refine((val) => !isNaN(val), 'Amount must be a valid number')
  .refine((val) => val > 0, 'Amount must be greater than 0')
  .refine((val) => val <= 999999999.99, 'Amount is too large');

/** Date validation schema */
export const dateSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.date, 'Date must be in YYYY-MM-DD format')
  .transform((val) => new Date(val))
  .refine((val) => !isNaN(val.getTime()), 'Invalid date')
  .refine((val) => val <= new Date(), 'Date cannot be in the future');

/** Optional note validation schema */
export const noteSchema = z
  .string()
  .max(255, 'Note must be 255 characters or less')
  .optional();

/** Transaction type validation */
export const transactionTypeSchema = z.enum(['income', 'expense'], {
  errorMap: () => ({ message: 'Transaction type must be either income or expense' })
});

/** Create transaction request schema */
export const createTransactionSchema = z.object({
  amount: amountSchema,
  categoryId: z.string().min(1, 'Category is required'),
  date: dateSchema,
  type: transactionTypeSchema,
  note: noteSchema
});

/** Update transaction request schema */
export const updateTransactionSchema = z.object({
  amount: amountSchema,
  categoryId: z.string().min(1, 'Category is required'),
  date: dateSchema,
  type: transactionTypeSchema,
  note: noteSchema
});

/** Transaction filter schema */
export const transactionFilterSchema = z.object({
  type: transactionTypeSchema.optional(),
  categoryId: z.string().optional(),
  startDate: z.string().regex(VALIDATION_PATTERNS.date, 'Start date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(VALIDATION_PATTERNS.date, 'End date must be in YYYY-MM-DD format').optional(),
  search: z.string().max(100, 'Search term must be 100 characters or less').optional(),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20)
});

/** Pagination schema */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20)
});

/** ID validation schema */
export const idSchema = z.string().min(1, 'ID is required');

/**
 * Validates a date string and ensures it's not in the future
 * @param dateString - The date string to validate
 * @returns The validated Date object
 */
export function validateDateNotFuture(dateString: string): Date {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  if (date > today) {
    throw new Error('Date cannot be in the future');
  }

  return date;
}

/**
 * Validates that a category type matches a transaction type
 * @param categoryType - The category type
 * @param transactionType - The transaction type
 * @throws Error if types don't match
 */
export function validateCategoryTypeMatch(
  categoryType: 'income' | 'expense',
  transactionType: 'income' | 'expense'
): void {
  if (categoryType !== transactionType) {
    throw new Error('Category type must match transaction type');
  }
}

/**
 * Validates password strength according to business rules
 * @param password - The password to validate
 * @returns True if password meets requirements
 */
export function isPasswordStrong(password: string): boolean {
  return VALIDATION_PATTERNS.password.test(password);
}

/**
 * Validates username format
 * @param username - The username to validate
 * @returns True if username is valid
 */
export function isValidUsername(username: string): boolean {
  return VALIDATION_PATTERNS.username.test(username);
}

/**
 * Validates category name format
 * @param name - The category name to validate
 * @returns True if name is valid
 */
export function isValidCategoryName(name: string): boolean {
  return VALIDATION_PATTERNS.categoryName.test(name);
}

/**
 * Validates amount format
 * @param amount - The amount to validate
 * @returns True if amount is valid
 */
export function isValidAmount(amount: number): boolean {
  return amount > 0 && amount <= 999999999.99 && Number.isFinite(amount);
}

/**
 * Sanitizes a string by trimming and removing extra whitespace
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Validates and sanitizes a search query
 * @param query - The search query to validate
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string {
  return sanitizeString(query).substring(0, 100);
}