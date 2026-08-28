/**
 * Transaction repository for data access operations
 * Handles all database interactions for transaction entities
 */

import { PrismaClient, TransactionType } from '@prisma/client';
import {
  ITransactionRepository,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
  TransactionListResult,
  TransactionSummary,
  MonthlyTransactionSummary,
  TransactionWithCategory
} from '../types/transaction';
import { logger } from '../utils/logger';
import { db } from '../config/database';

/**
 * Transaction repository implementation using Prisma ORM
 */
export class TransactionRepository implements ITransactionRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = db;
  }

  /**
   * Create a new transaction
   * @param data - Transaction data with userId
   * @returns Promise<TransactionWithCategory> - The created transaction with category
   */
  async create(data: CreateTransactionRequest & { userId: string }): Promise<TransactionWithCategory> {
    try {
      const transaction = await this.prisma.transaction.create({
        data: {
          ...data,
          type: data.type.toUpperCase() as TransactionType,
          amount: data.amount,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      logger.debug('Transaction created', {
        id: transaction.id,
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId
      });
      return transaction;
    } catch (error) {
      logger.error('Failed to create transaction', {
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to create transaction');
    }
  }

  /**
   * Find a transaction by its ID
   * @param id - The transaction ID to search for
   * @returns Promise<TransactionWithCategory | null> - The transaction with category, or null if not found
   */
  async findById(id: string): Promise<TransactionWithCategory | null> {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      logger.debug('Transaction lookup by ID', { id, found: !!transaction });
      return transaction;
    } catch (error) {
      logger.error('Failed to find transaction by ID', {
        id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to find transaction');
    }
  }

  /**
   * Find all transactions for a specific user with filtering and pagination
   * @param userId - The user ID to search for
   * @param filters - Optional filters for type, category, date range, search, and pagination
   * @returns Promise<TransactionListResult> - Paginated list of transactions with metadata
   */
  async findByUserId(userId: string, filters?: TransactionFilters): Promise<TransactionListResult> {
    try {
      const {
        type,
        categoryId,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 20
      } = filters || {};

      // Build where clause
      const where: any = { userId };

      if (type) {
        where.type = type.toUpperCase() as TransactionType;
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date.gte = new Date(startDate);
        }
        if (endDate) {
          where.date.lte = new Date(endDate);
        }
      }

      if (search) {
        where.OR = [
          { note: { contains: search } },
          { category: { name: { contains: search } } }
        ];
      }

      // Get total count for pagination
      const total = await this.prisma.transaction.count({ where });

      // Calculate pagination
      const skip = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Fetch transactions
      const transactions = await this.prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        },
        orderBy: [
          { date: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      });

      logger.debug('Transactions lookup by user ID', {
        userId,
        filters,
        count: transactions.length,
        total,
        page,
        totalPages
      });

      return {
        transactions,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      logger.error('Failed to find transactions by user ID', {
        userId,
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to find transactions');
    }
  }

  /**
   * Update an existing transaction
   * @param id - The transaction ID to update
   * @param data - Updated transaction data
   * @returns Promise<TransactionWithCategory> - The updated transaction with category
   */
  async update(id: string, data: UpdateTransactionRequest): Promise<TransactionWithCategory> {
    try {
      const transaction = await this.prisma.transaction.update({
        where: { id },
        data: {
          ...data,
          type: data.type.toUpperCase() as TransactionType,
          amount: data.amount,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      logger.debug('Transaction updated', {
        id,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId
      });
      return transaction;
    } catch (error) {
      logger.error('Failed to update transaction', {
        id,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to update transaction');
    }
  }

  /**
   * Delete a transaction
   * @param id - The transaction ID to delete
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.transaction.delete({
        where: { id },
      });

      logger.debug('Transaction deleted', { id });
    } catch (error) {
      logger.error('Failed to delete transaction', {
        id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to delete transaction');
    }
  }

  /**
   * Get transaction summary for a user with optional filters
   * @param userId - The user ID
   * @param filters - Optional filters for type, category, and date range
   * @returns Promise<TransactionSummary> - Summary with income, expenses, and balance
   */
  async getSummary(
    userId: string,
    filters?: Omit<TransactionFilters, 'page' | 'limit'>
  ): Promise<TransactionSummary> {
    try {
      const { type, categoryId, startDate, endDate } = filters || {};

      // Build where clause
      const where: any = { userId };

      if (type) {
        where.type = type.toUpperCase() as TransactionType;
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date.gte = new Date(startDate);
        }
        if (endDate) {
          where.date.lte = new Date(endDate);
        }
      }

      // Get aggregated data
      const result = await this.prisma.transaction.aggregate({
        where,
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      });

      // Get income and expenses separately
      const incomeResult = await this.prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' as TransactionType },
        _sum: { amount: true }
      });

      const expenseResult = await this.prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' as TransactionType },
        _sum: { amount: true }
      });

      const totalIncome = incomeResult._sum.amount ? Number(incomeResult._sum.amount) : 0;
      const totalExpenses = expenseResult._sum.amount ? Number(expenseResult._sum.amount) : 0;
      const balance = totalIncome - totalExpenses;
      const transactionCount = result._count.id || 0;

      logger.debug('Transaction summary generated', {
        userId,
        filters,
        totalIncome,
        totalExpenses,
        balance,
        transactionCount
      });

      return {
        totalIncome,
        totalExpenses,
        balance,
        transactionCount
      };
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
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months + 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: startDate }
        },
        select: {
          date: true,
          amount: true,
          type: true
        },
        orderBy: { date: 'asc' }
      });

      // Group by month
      const monthlyData = new Map<string, MonthlyTransactionSummary>();

      transactions.forEach(transaction => {
        const monthKey = transaction.date.toISOString().substring(0, 7); // YYYY-MM
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthKey,
            income: 0,
            expenses: 0,
            balance: 0,
            transactionCount: 0
          });
        }

        const monthData = monthlyData.get(monthKey)!;
        const amount = Number(transaction.amount);
        
        if (transaction.type === 'INCOME') {
          monthData.income += amount;
        } else {
          monthData.expenses += amount;
        }
        
        monthData.transactionCount++;
      });

      // Calculate balance for each month
      monthlyData.forEach(data => {
        data.balance = data.income - data.expenses;
      });

      const result = Array.from(monthlyData.values());

      logger.debug('Monthly transaction summary generated', {
        userId,
        months,
        dataPoints: result.length
      });

      return result;
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
   * Find a category by its ID
   * @param categoryId - The category ID to search for
   * @returns Promise<{ id: string; name: string; type: 'INCOME' | 'EXPENSE' } | null> - The category, or null if not found
   */
  async findCategoryById(categoryId: string): Promise<{ id: string; name: string; type: 'INCOME' | 'EXPENSE' } | null> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
        select: {
          id: true,
          name: true,
          type: true
        }
      });

      logger.debug('Category lookup by ID', { categoryId, found: !!category });
      return category;
    } catch (error) {
      logger.error('Failed to find category by ID', {
        categoryId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to find category');
    }
  }
}