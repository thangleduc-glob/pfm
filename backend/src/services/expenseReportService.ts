/**
 * Expense report service for generating category-based expense reports
 * Handles business logic for aggregating expenses by category
 */

import { TransactionRepository } from '../repositories/transactionRepository';
import { logger } from '../utils/logger';

/**
 * Expense category report data structure
 */
export interface ExpenseCategoryReport {
  categoryName: string;
  categoryId: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

/**
 * Complete expense report with grand total
 */
export interface ExpenseReport {
  categories: ExpenseCategoryReport[];
  grandTotal: number;
  totalTransactions: number;
  generatedAt: Date;
}

/**
 * Expense report filters
 */
export interface ExpenseReportFilters {
  startDate?: Date;
  endDate?: Date;
  categoryIds?: string[];
}

/**
 * Expense report service interface
 */
export interface IExpenseReportService {
  generateExpenseReport(userId: string, filters?: ExpenseReportFilters): Promise<ExpenseReport>;
}

/**
 * Expense report service implementation
 */
export class ExpenseReportService implements IExpenseReportService {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  /**
   * Generate an expense report grouped by category
   * @param userId - The user ID to generate the report for
   * @param filters - Optional filters for date range and categories
   * @returns Promise<ExpenseReport> - The complete expense report
   */
  async generateExpenseReport(
    userId: string,
    filters?: ExpenseReportFilters
  ): Promise<ExpenseReport> {
    try {
      const { startDate, endDate, categoryIds } = filters || {};

      logger.info('Generating expense report', {
        userId,
        filters: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          categoryIds: categoryIds?.length
        }
      });

      // Build filter object
      const transactionFilters: any = {
        type: 'EXPENSE',
        page: 1,
        limit: 10000 // Use a high limit to get all transactions
      };

      if (startDate) {
        transactionFilters.startDate = startDate;
      }

      if (endDate) {
        transactionFilters.endDate = endDate;
      }

      // Get all expense transactions for the user within the date range
      const transactionResult = await this.transactionRepository.findByUserId(userId, transactionFilters);

      // Filter by category IDs if provided
      let filteredTransactions = transactionResult.transactions;
      if (categoryIds && categoryIds.length > 0) {
        filteredTransactions = filteredTransactions.filter(transaction =>
          categoryIds.includes(transaction.categoryId)
        );
      }

      // Group transactions by category
      const categoryMap = new Map<string, ExpenseCategoryReport>();

      filteredTransactions.forEach(transaction => {
        const categoryId = transaction.categoryId;
        const categoryName = transaction.category.name;
        const amount = Number(transaction.amount);

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            categoryName,
            categoryId,
            totalAmount: 0,
            transactionCount: 0,
            percentage: 0
          });
        }

        const categoryReport = categoryMap.get(categoryId)!;
        categoryReport.totalAmount += amount;
        categoryReport.transactionCount++;
      });

      // Calculate grand total
      const grandTotal = Array.from(categoryMap.values())
        .reduce((sum, category) => sum + category.totalAmount, 0);

      // Calculate percentages and sort by total amount (highest first)
      const categories = Array.from(categoryMap.values())
        .map(category => ({
          ...category,
          percentage: grandTotal > 0 ? (category.totalAmount / grandTotal) * 100 : 0
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

      const report: ExpenseReport = {
        categories,
        grandTotal,
        totalTransactions: filteredTransactions.length,
        generatedAt: new Date()
      };

      logger.info('Expense report generated successfully', {
        userId,
        categoryCount: categories.length,
        grandTotal,
        totalTransactions: filteredTransactions.length
      });

      return report;
    } catch (error) {
      logger.error('Failed to generate expense report', {
        userId,
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to generate expense report');
    }
  }
}