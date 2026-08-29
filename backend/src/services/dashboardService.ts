/**
 * Dashboard service for financial summary calculations
 * Handles all dashboard-related business operations and calculations
 */

import { TransactionRepository } from '../repositories/transactionRepository';
import { logger } from '../utils/logger';

/**
 * Dashboard data interface
 */
export interface DashboardData {
  currentBalance: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  remainingAmount: number;
}

/**
 * Dashboard service implementation with financial calculations
 */
export class DashboardService {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  /**
   * Get dashboard financial summary for a user
   * @param userId - The user ID to get dashboard data for
   * @returns Promise<DashboardData> - The dashboard financial summary
   */
  async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      // Get current date and first day of current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get all-time summary for current balance
      const allTimeSummary = await this.transactionRepository.getSummary(userId, {});

      // Get current month summary
      const currentMonthSummary = await this.transactionRepository.getSummary(userId, {
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth
      });

      // Calculate dashboard data
      const dashboardData: DashboardData = {
        currentBalance: allTimeSummary.balance,
        currentMonthIncome: currentMonthSummary.totalIncome,
        currentMonthExpenses: currentMonthSummary.totalExpenses,
        remainingAmount: currentMonthSummary.balance
      };

      logger.info('Dashboard data retrieved successfully', {
        userId,
        currentBalance: dashboardData.currentBalance,
        currentMonthIncome: dashboardData.currentMonthIncome,
        currentMonthExpenses: dashboardData.currentMonthExpenses
      });

      return dashboardData;
    } catch (error) {
      logger.error('Failed to get dashboard data', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get current balance (income - expenses) for a user
   * @param userId - The user ID to get balance for
   * @returns Promise<number> - The current balance
   */
  async getCurrentBalance(userId: string): Promise<number> {
    try {
      const summary = await this.transactionRepository.getSummary(userId, {});
      return summary.balance;
    } catch (error) {
      logger.error('Failed to get current balance', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get current month income for a user
   * @param userId - The user ID to get income for
   * @returns Promise<number> - The current month income
   */
  async getCurrentMonthIncome(userId: string): Promise<number> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const summary = await this.transactionRepository.getSummary(userId, {
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth
      });

      return summary.totalIncome;
    } catch (error) {
      logger.error('Failed to get current month income', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get current month expenses for a user
   * @param userId - The user ID to get expenses for
   * @returns Promise<number> - The current month expenses
   */
  async getCurrentMonthExpenses(userId: string): Promise<number> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const summary = await this.transactionRepository.getSummary(userId, {
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth
      });

      return summary.totalExpenses;
    } catch (error) {
      logger.error('Failed to get current month expenses', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get remaining amount (income - expenses) for current month
   * @param userId - The user ID to get remaining amount for
   * @returns Promise<number> - The remaining amount for current month
   */
  async getCurrentMonthRemaining(userId: string): Promise<number> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const summary = await this.transactionRepository.getSummary(userId, {
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth
      });

      return summary.balance;
    } catch (error) {
      logger.error('Failed to get current month remaining amount', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}