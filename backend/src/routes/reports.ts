/**
 * Reports routes for expense report endpoints
 * Defines API routes for generating expense reports
 */

import { Router } from 'express';
import { ExpenseReportController } from '../controllers/expenseReportController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const expenseReportController = new ExpenseReportController();

/**
 * Query parameters schema for expense report generation
 */
const expenseReportQuerySchema = z.object({
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  categoryIds: z.string().optional().transform(val => val ? val.split(',') : undefined)
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['startDate']
  }
);

/**
 * @route GET /api/v1/reports/expenses
 * @desc Generate expense report grouped by category
 * @access Private
 * @query {startDate?: string, endDate?: string, categoryIds?: string}
 */
router.get(
  '/expenses',
  authenticate(),
  validateRequest(expenseReportQuerySchema),
  expenseReportController.generateExpenseReport.bind(expenseReportController)
);

export { router as reportsRoutes };