/**
 * Dashboard routes for API endpoints
 * Defines all dashboard-related routes and their handlers
 */

import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/auth';

// Create router instance
const router = Router();
const dashboardController = new DashboardController();

/**
 * Apply authentication middleware to all dashboard routes
 */
router.use(requireAuth);

/**
 * GET /api/v1/dashboard
 * Get complete dashboard financial summary
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     currentBalance: number,
 *     currentMonthIncome: number,
 *     currentMonthExpenses: number,
 *     remainingAmount: number
 *   },
 *   message: "Dashboard data retrieved successfully"
 * }
 */
router.get('/', dashboardController.getDashboard.bind(dashboardController));

/**
 * GET /api/v1/dashboard/balance
 * Get current balance (income - expenses)
 * 
 * Response:
 * {
 *   success: true,
 *   data: { balance: number },
 *   message: "Current balance retrieved successfully"
 * }
 */
router.get('/balance', dashboardController.getCurrentBalance.bind(dashboardController));

/**
 * GET /api/v1/dashboard/income
 * Get current month income
 * 
 * Response:
 * {
 *   success: true,
 *   data: { income: number },
 *   message: "Current month income retrieved successfully"
 * }
 */
router.get('/income', dashboardController.getCurrentMonthIncome.bind(dashboardController));

/**
 * GET /api/v1/dashboard/expenses
 * Get current month expenses
 * 
 * Response:
 * {
 *   success: true,
 *   data: { expenses: number },
 *   message: "Current month expenses retrieved successfully"
 * }
 */
router.get('/expenses', dashboardController.getCurrentMonthExpenses.bind(dashboardController));

/**
 * GET /api/v1/dashboard/remaining
 * Get current month remaining amount (income - expenses)
 * 
 * Response:
 * {
 *   success: true,
 *   data: { remaining: number },
 *   message: "Current month remaining amount retrieved successfully"
 * }
 */
router.get('/remaining', dashboardController.getCurrentMonthRemaining.bind(dashboardController));

export { router as dashboardRoutes };