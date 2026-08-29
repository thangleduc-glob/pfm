/**
 * Dashboard controller for handling dashboard API endpoints
 * Manages HTTP requests and responses for dashboard operations
 */

import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { logger } from '../utils/logger';

/**
 * Dashboard controller class
 */
export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  /**
   * Get dashboard financial summary for the authenticated user
   * @param req - Express request object
   * @param res - Express response object
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from authenticated request (added by auth middleware)
      const userId = (req as any).user.id;

      // Get dashboard data
      const dashboardData = await this.dashboardService.getDashboardData(userId);

      // Return success response
      res.status(200).json({
        success: true,
        data: dashboardData,
        message: 'Dashboard data retrieved successfully'
      });

      logger.info('Dashboard data retrieved', {
        userId,
        currentBalance: dashboardData.currentBalance
      });
    } catch (error) {
      logger.error('Failed to get dashboard data', {
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Return error response
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard data',
        error: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Unknown error'
          : 'Internal server error'
      });
    }
  }

  /**
   * Get current balance for the authenticated user
   * @param req - Express request object
   * @param res - Express response object
   */
  async getCurrentBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const balance = await this.dashboardService.getCurrentBalance(userId);

      res.status(200).json({
        success: true,
        data: { balance },
        message: 'Current balance retrieved successfully'
      });

      logger.info('Current balance retrieved', { userId, balance });
    } catch (error) {
      logger.error('Failed to get current balance', {
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve current balance',
        error: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Unknown error'
          : 'Internal server error'
      });
    }
  }

  /**
   * Get current month income for the authenticated user
   * @param req - Express request object
   * @param res - Express response object
   */
  async getCurrentMonthIncome(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const income = await this.dashboardService.getCurrentMonthIncome(userId);

      res.status(200).json({
        success: true,
        data: { income },
        message: 'Current month income retrieved successfully'
      });

      logger.info('Current month income retrieved', { userId, income });
    } catch (error) {
      logger.error('Failed to get current month income', {
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve current month income',
        error: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Unknown error'
          : 'Internal server error'
      });
    }
  }

  /**
   * Get current month expenses for the authenticated user
   * @param req - Express request object
   * @param res - Express response object
   */
  async getCurrentMonthExpenses(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const expenses = await this.dashboardService.getCurrentMonthExpenses(userId);

      res.status(200).json({
        success: true,
        data: { expenses },
        message: 'Current month expenses retrieved successfully'
      });

      logger.info('Current month expenses retrieved', { userId, expenses });
    } catch (error) {
      logger.error('Failed to get current month expenses', {
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve current month expenses',
        error: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Unknown error'
          : 'Internal server error'
      });
    }
  }

  /**
   * Get current month remaining amount for the authenticated user
   * @param req - Express request object
   * @param res - Express response object
   */
  async getCurrentMonthRemaining(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const remaining = await this.dashboardService.getCurrentMonthRemaining(userId);

      res.status(200).json({
        success: true,
        data: { remaining },
        message: 'Current month remaining amount retrieved successfully'
      });

      logger.info('Current month remaining amount retrieved', { userId, remaining });
    } catch (error) {
      logger.error('Failed to get current month remaining amount', {
        userId: (req as any).user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve current month remaining amount',
        error: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Unknown error'
          : 'Internal server error'
      });
    }
  }
}