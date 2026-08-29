/**
 * Expense report controller for handling HTTP requests
 * Manages API endpoints for expense report generation
 */

import { Request, Response } from 'express';
import { ExpenseReportService } from '../services/expenseReportService';
import { logger } from '../utils/logger';

/**
 * Expense report controller class
 */
export class ExpenseReportController {
  private expenseReportService: ExpenseReportService;

  constructor() {
    this.expenseReportService = new ExpenseReportService();
  }

  /**
   * Generate expense report for the authenticated user
   * @param req - Express request object with user information
   * @param res - Express response object
   */
  async generateExpenseReport(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Extract optional filters from query parameters
      const { startDate, endDate, categoryIds } = req.query;

      const filters: any = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        categoryIds: categoryIds ? (categoryIds as string).split(',') : undefined
      };

      // Validate date filters
      if (filters.startDate && isNaN(filters.startDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid start date format'
        });
        return;
      }

      if (filters.endDate && isNaN(filters.endDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid end date format'
        });
        return;
      }

      // Validate date range
      if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date must be before end date'
        });
        return;
      }

      logger.info('Expense report request received', {
        userId,
        filters
      });

      const report = await this.expenseReportService.generateExpenseReport(userId, filters);

      res.status(200).json({
        success: true,
        data: report,
        message: 'Expense report generated successfully'
      });

      logger.info('Expense report sent successfully', {
        userId,
        categoryCount: report.categories.length,
        grandTotal: report.grandTotal
      });
    } catch (error) {
      logger.error('Failed to generate expense report', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to generate expense report'
      });
    }
  }
}