/**
 * Transaction validation schemas using Zod
 * Defines validation rules for all transaction-related operations
 */

import { z } from 'zod';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFilterSchema
} from '../utils/validation';

/**
 * Schema for validating transaction creation requests
 * Extends the base schema with additional business rules
 */
export const createTransactionRequestSchema = createTransactionSchema
  .refine(
    () => {
      // Additional validation can be added here if needed
      return true;
    },
    {
      message: 'Invalid transaction data',
      path: ['root']
    }
  );

/**
 * Schema for validating transaction update requests
 * Extends the base schema with additional business rules
 */
export const updateTransactionRequestSchema = updateTransactionSchema
  .refine(
    () => {
      // Additional validation can be added here if needed
      return true;
    },
    {
      message: 'Invalid transaction data',
      path: ['root']
    }
  );

/**
 * Schema for validating transaction filter parameters
 * Used for querying and filtering transactions
 */
export const transactionFilterRequestSchema = transactionFilterSchema;

/**
 * Schema for validating transaction ID parameters
 * Used for identifying transactions in operations
 */
export const transactionIdSchema = z.string().min(1, 'ID is required').trim().min(1, 'ID cannot be whitespace only');

/**
 * Schema for validating transaction deletion requests
 * Ensures the transaction ID is provided
 */
export const deleteTransactionRequestSchema = z.object({
  id: transactionIdSchema
});

/**
 * Schema for validating transaction queries with user context
 * Ensures user ownership is enforced
 */
export const transactionQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  transactionId: transactionIdSchema.optional()
});

/**
 * Schema for validating transaction summary requests
 * Used for generating financial summaries
 */
export const transactionSummaryRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().optional()
});

/**
 * Schema for validating monthly summary requests
 * Used for generating monthly financial reports
 */
export const monthlySummaryRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  months: z.coerce.number().int().min(1, 'Months must be at least 1').max(24, 'Cannot request more than 24 months').default(12)
});

/**
 * Type exports for use in services and controllers
 */
export type CreateTransactionRequest = z.infer<typeof createTransactionRequestSchema>;
export type UpdateTransactionRequest = z.infer<typeof updateTransactionRequestSchema>;
export type TransactionFilterRequest = z.infer<typeof transactionFilterRequestSchema>;
export type TransactionIdRequest = z.infer<typeof deleteTransactionRequestSchema>;
export type TransactionQueryRequest = z.infer<typeof transactionQuerySchema>;
export type TransactionSummaryRequest = z.infer<typeof transactionSummaryRequestSchema>;
export type MonthlySummaryRequest = z.infer<typeof monthlySummaryRequestSchema>;