/**
 * Category routes
 * Defines all category-related API endpoints
 */

import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
} from '../controllers/categoryController';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import {
  createCategoryRequestSchema,
  updateCategoryRequestSchema,
  categoryIdParamSchema,
} from '../schemas/categorySchema';

const router = Router();

/**
 * @route GET /api/v1/categories
 * @desc Get all categories for the authenticated user
 * @access Private
 */
router.get(
  '/',
  authenticate({ required: true }),
  getCategories
);

/**
 * @route POST /api/v1/categories
 * @desc Create a new category
 * @access Private
 */
router.post(
  '/',
  authenticate({ required: true }),
  validateRequest(createCategoryRequestSchema, 'body'),
  createCategory
);

/**
 * @route GET /api/v1/categories/:id
 * @desc Get a single category by ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate({ required: true }),
  validateRequest(categoryIdParamSchema, 'params'),
  getCategory
);

/**
 * @route PUT /api/v1/categories/:id
 * @desc Update an existing category
 * @access Private
 */
router.put(
  '/:id',
  authenticate({ required: true }),
  validateRequest(categoryIdParamSchema, 'params'),
  validateRequest(updateCategoryRequestSchema, 'body'),
  updateCategory
);

/**
 * @route DELETE /api/v1/categories/:id
 * @desc Delete a category
 * @access Private
 */
router.delete(
  '/:id',
  authenticate({ required: true }),
  validateRequest(categoryIdParamSchema, 'params'),
  deleteCategory
);

export { router as categoryRoutes };