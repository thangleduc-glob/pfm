/**
 * Transaction controller
 * Handles HTTP requests for transaction CRUD operations
 */

import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import { logger } from '../utils/logger';
import {
  updateTransactionRequestSchema,
  transactionFilterRequestSchema,
  transactionIdSchema,
} from '../schemas/transactionSchema';

// Create a singleton instance of the transaction service
const transactionService = new TransactionService();

/**
 * Get all transactions for the authenticated user with filtering and pagination
 * GET /api/v1/transactions
 */
export async function getTransactions(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (attached by auth middleware)
    const userId = req.userId;

    if (!userId) {
      logger.warn('Get transactions failed - no user ID in request', {
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Parse and validate query parameters
    const queryParams = transactionFilterRequestSchema.parse(req.query);
    
    // Parse pagination parameters
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Ensure limit is within reasonable bounds
    const validLimit = Math.min(Math.max(limit, 1), 100);
    const validOffset = Math.max(offset, 0);

    // Build filters object without undefined values
    const filters: any = {
      limit: validLimit,
      page: Math.floor(validOffset / validLimit) + 1,
    };
    
    if (queryParams.type) filters.type = queryParams.type;
    if (queryParams.categoryId) filters.categoryId = queryParams.categoryId;
    if (queryParams.startDate) filters.startDate = queryParams.startDate;
    if (queryParams.endDate) filters.endDate = queryParams.endDate;
    if (queryParams.search) filters.search = queryParams.search;
    
    // Get transactions for the user with filters and pagination
    const result = await transactionService.findByUser(userId, filters);

    logger.info('Transactions retrieved successfully', {
      userId,
      count: result.transactions.length,
      total: result.total,
      limit: validLimit,
      offset: validOffset,
    });

    res.status(200).json({
      transactions: result.transactions,
      pagination: {
        limit: validLimit,
        offset: validOffset,
        total: result.total,
        hasMore: validOffset + result.transactions.length < result.total,
      },
    });
  } catch (error) {
    logger.error('Get transactions failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.userId,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Failed to retrieve transactions',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
}

/**
 * Get a single transaction by ID
 * GET /api/v1/transactions/:id
 */
export async function getTransaction(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (attached by auth middleware)
    const userId = req.userId;

    if (!userId) {
      logger.warn('Get transaction failed - no user ID in request', {
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Validate transaction ID parameter
    const id = transactionIdSchema.parse(req.params);

    // Get transaction for the user
    const transaction = await transactionService.findById(id, userId);

    if (!transaction) {
      logger.warn('Transaction not found', {
        transactionId: id,
        userId,
        path: req.path,
        method: req.method,
      });

      res.status(404).json({
        error: 'Transaction not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    logger.info('Transaction retrieved successfully', {
      transactionId: id,
      userId,
    });

    res.status(200).json({
      transaction,
    });
  } catch (error) {
    logger.error('Get transaction failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.userId,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Failed to retrieve transaction',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
}

/**
 * Create a new transaction
 * POST /api/v1/transactions
 */
export async function createTransaction(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (attached by auth middleware)
    const userId = req.userId;

    if (!userId) {
      logger.warn('Create transaction failed - no user ID in request', {
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }
    
    const transaction = await transactionService.create(userId, req.body);

    logger.info('Transaction created successfully', {
      transactionId: transaction.id,
      userId,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
    });

    res.status(201).json({
      transaction,
      message: 'Transaction created successfully',
    });
  } catch (error) {
    logger.error('Create transaction failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.userId,
      path: req.path,
      method: req.method,
    });

    // Handle validation errors
    if (error instanceof Error && error.message.includes('Amount must be greater than 0')) {
      res.status(400).json({
        error: 'Invalid transaction data',
        code: 'VALIDATION_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Handle category not found error
    if (error instanceof Error && error.message.includes('Category not found')) {
      res.status(404).json({
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Handle category type mismatch error
    if (error instanceof Error && error.message.includes('Category type must match transaction type')) {
      res.status(400).json({
        error: 'Category type mismatch',
        code: 'CATEGORY_TYPE_MISMATCH',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Handle date validation error
    if (error instanceof Error && error.message.includes('Date cannot be in the future')) {
      res.status(400).json({
        error: 'Invalid date',
        code: 'INVALID_DATE',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to create transaction',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
}

/**
 * Update an existing transaction
 * PUT /api/v1/transactions/:id
 */
export async function updateTransaction(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (attached by auth middleware)
    const userId = req.userId;

    if (!userId) {
      logger.warn('Update transaction failed - no user ID in request', {
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Validate transaction ID parameter
    const id = transactionIdSchema.parse(req.params);

    // Validate request body
    const transactionData = updateTransactionRequestSchema.parse(req.body);

    // Update transaction for the user
    const updateData: any = {};
    
    if (transactionData.amount !== undefined) updateData.amount = transactionData.amount;
    if (transactionData.categoryId !== undefined) updateData.categoryId = transactionData.categoryId;
    if (transactionData.date !== undefined) updateData.date = transactionData.date;
    if (transactionData.type !== undefined) updateData.type = transactionData.type;
    if (transactionData.note !== undefined) updateData.note = transactionData.note;
    
    const transaction = await transactionService.update(id, userId, updateData);

    if (!transaction) {
      logger.warn('Transaction not found for update', {
        transactionId: id,
        userId,
        path: req.path,
        method: req.method,
      });

      res.status(404).json({
        error: 'Transaction not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    logger.info('Transaction updated successfully', {
      transactionId: id,
      userId,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
    });

    res.status(200).json({
      transaction,
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    logger.error('Update transaction failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.userId,
      path: req.path,
      method: req.method,
    });

    // Handle validation errors
    if (error instanceof Error && error.message.includes('Amount must be greater than 0')) {
      res.status(400).json({
        error: 'Invalid transaction data',
        code: 'VALIDATION_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Handle category not found error
    if (error instanceof Error && error.message.includes('Category not found')) {
      res.status(404).json({
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Handle category type mismatch error
    if (error instanceof Error && error.message.includes('Category type must match transaction type')) {
      res.status(400).json({
        error: 'Category type mismatch',
        code: 'CATEGORY_TYPE_MISMATCH',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Handle date validation error
    if (error instanceof Error && error.message.includes('Date cannot be in the future')) {
      res.status(400).json({
        error: 'Invalid date',
        code: 'INVALID_DATE',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to update transaction',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
}

/**
 * Delete a transaction
 * DELETE /api/v1/transactions/:id
 */
export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (attached by auth middleware)
    const userId = req.userId;

    if (!userId) {
      logger.warn('Delete transaction failed - no user ID in request', {
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Validate transaction ID parameter
    const id = transactionIdSchema.parse(req.params);

    // Delete transaction for the user
        await transactionService.delete(id, userId);

        logger.info('Transaction deleted successfully', {
          transactionId: id,
          userId,
        });

        res.status(200).json({
          message: 'Transaction deleted successfully',
        });
  } catch (error) {
    logger.error('Delete transaction failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.userId,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Failed to delete transaction',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
}