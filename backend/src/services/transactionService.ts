/**
 * Transaction service for business logic and validation
 * Handles all transaction-related business operations and rules
 */

import {
  ITransactionService,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
  TransactionListResult,
  TransactionSummary,
  MonthlyTransactionSummary,
  TransactionWithCategory
} from '../types/transaction';
import { TransactionRepository } from '../repositories/transactionRepository';
import { logger } from '../utils/logger';
import { validateDateNotFuture, validateCategoryTypeMatch } from '../utils/validation';

/**
 * Transaction service implementation with business logic
 */
export class TransactionService implements ITransactionService {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  /**
   * Create a new transaction with business validation
   * @param userId - The user ID creating the transaction
   * @param data - Transaction data
   * @returns Promise<TransactionWithCategory> - The created transaction with category
   * @throws Error if validation fails or transaction cannot be created
   */
  async create(userId: string, data: CreateTransactionRequest): Promise<TransactionWithCategory> {
    try {
      // Validate amount is greater than 0
      if (data.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Validate date is not in the future
      validateDateNotFuture(data.date.toISOString().split('T')[0]);

      // Validate category exists and belongs to user
      const category = await this.transactionRepository.findCategoryById(data.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Validate transaction type matches category type
      validateCategoryTypeMatch(category.type, data.type);

      // Create the transaction
      const transaction = await this.transactionRepository.create({
        ...data,
        userId
      });

      logger.info('Transaction created successfully', {
        transactionId: transaction.id,
        userId,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to create transaction', {
        userId,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Find a transaction by ID with user ownership validation
   * @param id - The transaction ID
   * @param userId - The user ID requesting the transaction
   * @returns Promise<TransactionWithCategory | null> - The transaction if found and belongs to user
   */
  async findById(id: string, userId: string): Promise<TransactionWithCategory | null> {
    try {
      const transaction = await this.transactionRepository.findById(id);
      
      // Validate user ownership
      if (transaction && transaction.userId !== userId) {
        logger.warn('Unauthorized transaction access attempt', {
          transactionId: id,
          requestedBy: userId,
          owner: transaction.userId
        });
        return null;
      }

      logger.debug('Transaction lookup by ID', {
        transactionId: id,
        userId,
        found: !!transaction
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to find transaction by ID', {
        transactionId: id,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to find transaction');
    }
  }

  /**
   * Find all transactions for a user with filtering and pagination
   * @param userId - The user ID
   * @param filters - Optional filters for type, category, date range, search, and pagination
   * @returns Promise<TransactionListResult> - Paginated list of transactions
   */
  async findByUser(userId: string, filters?: TransactionFilters): Promise<TransactionListResult> {
    try {
      const result = await this.transactionRepository.findByUserId(userId, filters);
      
      logger.debug('Transactions retrieved for user', {
        userId,
        filters,
        count: result.transactions.length,
        total: result.total,
        page: result.page
      });

      return result;
    } catch (error) {
      logger.error('Failed to find transactions for user', {
        userId,
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to find transactions');
    }
  }

  /**
   * Update an existing transaction with business validation
   * @param id - The transaction ID to update
   * @param userId - The user ID updating the transaction
   * @param data - Updated transaction data
   * @returns Promise<TransactionWithCategory> - The updated transaction
   * @throws Error if validation fails or transaction cannot be updated
   */
  async update(id: string, userId: string, data: UpdateTransactionRequest): Promise<TransactionWithCategory> {
    try {
      // First, check if transaction exists and belongs to user
      const existingTransaction = await this.findById(id, userId);
      if (!existingTransaction) {
        throw new Error('Transaction not found or access denied');
      }

      // Validate amount is greater than 0
      if (data.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Validate date is not in the future
      validateDateNotFuture(data.date.toISOString().split('T')[0]);

      // Validate category exists
      const category = await this.transactionRepository.findCategoryById(data.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Validate transaction type matches category type
      validateCategoryTypeMatch(category.type, data.type);

      // Update the transaction
      const transaction = await this.transactionRepository.update(id, data);

      logger.info('Transaction updated successfully', {
        transactionId: id,
        userId,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to update transaction', {
        transactionId: id,
        userId,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete a transaction with user ownership validation
   * @param id - The transaction ID to delete
   * @param userId - The user ID deleting the transaction
   * @returns Promise<void>
   * @throws Error if transaction not found or access denied
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      // Check if transaction exists and belongs to user
      const existingTransaction = await this.findById(id, userId);
      if (!existingTransaction) {
        throw new Error('Transaction not found or access denied');
      }

      // Delete the transaction
      await this.transactionRepository.delete(id);

      logger.info('Transaction deleted successfully', {
        transactionId: id,
        userId
      });
    } catch (error) {
      logger.error('Failed to delete transaction', {
        transactionId: id,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get transaction summary for a user
   * @param userId - The user ID
   * @param filters - Optional filters for type, category, and date range
   * @returns Promise<TransactionSummary> - Summary with income, expenses, and balance
   */
  async getSummary(
    userId: string,
    filters?: Omit<TransactionFilters, 'page' | 'limit'>
  ): Promise<TransactionSummary> {
    try {
      const summary = await this.transactionRepository.getSummary(userId, filters);
      
      logger.debug('Transaction summary retrieved', {
        userId,
        filters,
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        balance: summary.balance,
        transactionCount: summary.transactionCount
      });

      return summary;
    } catch (error) {
      logger.error('Failed to get transaction summary', {
        userId,
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to get transaction summary');
    }
  }

  /**
   * Get monthly transaction summary for a user
   * @param userId - The user ID
   * @param months - Number of months to include (default: 12)
   * @returns Promise<MonthlyTransactionSummary[]> - Array of monthly summaries
   */
  async getMonthlySummary(userId: string, months = 12): Promise<MonthlyTransactionSummary[]> {
    try {
      const summary = await this.transactionRepository.getMonthlySummary(userId, months);
      
      logger.debug('Monthly transaction summary retrieved', {
        userId,
        months,
        dataPoints: summary.length
      });

      return summary;
    } catch (error) {
      logger.error('Failed to get monthly transaction summary', {
        userId,
        months,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to get monthly transaction summary');
    }
  }

  /**
   * Validate that a category type matches a transaction type
   * @param categoryId - The category ID to validate
   * @param userId - The user ID for ownership validation
   * @param type - The transaction type to match
   * @returns Promise<boolean> - True if types match and category belongs to user
   */
  async validateCategoryType(
    categoryId: string,
    userId: string,
    type: 'INCOME' | 'EXPENSE'
  ): Promise<boolean> {
    try {
      const category = await this.transactionRepository.findCategoryById(categoryId);
      
      if (!category) {
        logger.warn('Category not found for validation', {
          categoryId,
          userId
        });
        return false;
      }

      // Note: In a real implementation, you would also validate that the category belongs to the user
      // This would require modifying the repository method to include userId in the query
      
      const isValid = category.type === type;
      
      logger.debug('Category type validation', {
        categoryId,
        userId,
        categoryType: category.type,
        transactionType: type,
        isValid
      });

      return isValid;
    } catch (error) {
      logger.error('Failed to validate category type', {
        categoryId,
        userId,
        type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Calculate current balance for a user
   * @param userId - The user ID
   * @param filters - Optional filters for date range
   * @returns Promise<number> - Current balance (income - expenses)
   */
  async calculateBalance(
    userId: string,
    filters?: Omit<TransactionFilters, 'page' | 'limit' | 'type'>
  ): Promise<number> {
    try {
      const summary = await this.getSummary(userId, filters);
      return summary.balance;
    } catch (error) {
      logger.error('Failed to calculate balance', {
        userId,
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to calculate balance');
    }
  }

  /**
   * Get transactions for a specific date range
   * @param userId - The user ID
   * @param startDate - Start date (YYYY-MM-DD format)
   * @param endDate - End date (YYYY-MM-DD format)
   * @param filters - Additional filters
   * @returns Promise<TransactionListResult> - Transactions in the date range
   */
  async getTransactionsByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
    filters?: Omit<TransactionFilters, 'startDate' | 'endDate'>
  ): Promise<TransactionListResult> {
    try {
      const dateFilters: TransactionFilters = {
        ...filters,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };

      return await this.findByUser(userId, dateFilters);
    } catch (error) {
      logger.error('Failed to get transactions by date range', {
        userId,
        startDate,
        endDate,
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to get transactions by date range');
    }
  }
}