/**
 * Transaction routes
 * Defines all transaction-related API endpoints
 */

import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransaction,
} from '../controllers/transactionController';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import {
  createTransactionRequestSchema,
  updateTransactionRequestSchema,
  transactionFilterRequestSchema,
  transactionIdSchema,
} from '../schemas/transactionSchema';

const router = Router();

/**
 * @route GET /api/v1/transactions
 * @desc Get all transactions for the authenticated user with filtering and pagination
 * @access Private
 * @query {type?, categoryId?, startDate?, endDate?, limit?, offset?}
 */
router.get(
  '/',
  authenticate({ required: true }),
  validateRequest(transactionFilterRequestSchema, 'query'),
  getTransactions
);

/**
 * @route POST /api/v1/transactions
 * @desc Create a new transaction
 * @access Private
 * @body {amount, categoryId, date, type, note?}
 */
router.post(
  '/',
  authenticate({ required: true }),
  validateRequest(createTransactionRequestSchema, 'body'),
  createTransaction
);

/**
 * @route GET /api/v1/transactions/:id
 * @desc Get a single transaction by ID
 * @access Private
 * @params {id}
 */
router.get(
  '/:id',
  authenticate({ required: true }),
  validateRequest(transactionIdSchema, 'params'),
  getTransaction
);

/**
 * @route PUT /api/v1/transactions/:id
 * @desc Update an existing transaction
 * @access Private
 * @params {id}
 * @body {amount?, categoryId?, date?, type?, note?}
 */
router.put(
  '/:id',
  authenticate({ required: true }),
  validateRequest(transactionIdSchema, 'params'),
  validateRequest(updateTransactionRequestSchema, 'body'),
  updateTransaction
);

/**
 * @route DELETE /api/v1/transactions/:id
 * @desc Delete a transaction
 * @access Private
 * @params {id}
 */
router.delete(
  '/:id',
  authenticate({ required: true }),
  validateRequest(transactionIdSchema, 'params'),
  deleteTransaction
);

export { router as transactionRoutes };