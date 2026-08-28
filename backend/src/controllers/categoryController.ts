/**
 * Category controller
 * Handles HTTP requests for category CRUD operations
 */

import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';
import { logger } from '../utils/logger';
import {
  createCategoryRequestSchema,
  updateCategoryRequestSchema,
  categoryIdParamSchema,
} from '../schemas/categorySchema';

// Create a singleton instance of the category service
const categoryService = new CategoryService();

/**
 * Get all categories for the authenticated user
 * GET /api/v1/categories
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (attached by auth middleware)
    const userId = req.userId;

    if (!userId) {
      logger.warn('Get categories failed - no user ID in request', {
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Get categories for the user
    const categories = await categoryService.findByUser(userId);

    logger.info('Categories retrieved successfully', {
      userId,
      count: categories.length,
    });

    res.status(200).json({
      categories,
      count: categories.length,
    });
  } catch (error) {
    logger.error('Get categories failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.userId,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Failed to retrieve categories',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
}

/**
 * Create a new category
 * POST /api/v1/categories
 */
export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (attached by auth middleware)
    const userId = req.userId;

    if (!userId) {
      logger.warn('Create category failed - no user ID in request', {
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Validate request body
    const categoryData = createCategoryRequestSchema.parse(req.body);

    // Create the category
    const category = await categoryService.create(userId, categoryData);

    logger.info('Category created successfully', {
      id: category.id,
      userId,
      name: category.name,
      type: category.type,
    });

    res.status(201).json({
      category,
      message: 'Category created successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Category with this name and type already exists') {
      logger.warn('Category creation failed - duplicate name', {
        userId: req.userId,
        name: req.body.name,
        type: req.body.type,
        path: req.path,
        method: req.method,
      });

      res.status(409).json({
        error: 'Category already exists',
        code: 'DUPLICATE_CATEGORY',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        details: [
          {
            field: 'name',
            message: 'Category with this name and type already exists',
          },
        ],
      });
      return;
    }

    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('Category creation failed - validation error', {
        error: error.message,
        userId: req.userId,
        path: req.path,
        method: req.method,
      });

      res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        details: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    logger.error('Create category failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.userId,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Failed to create category',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
}

/**
 * Update an existing category
 * PUT /api/v1/categories/:id
 */
export async function updateCategory(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (attached by auth middleware)
    const userId = req.userId;

    if (!userId) {
      logger.warn('Update category failed - no user ID in request', {
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Validate request parameters and body
    const { id } = categoryIdParamSchema.parse(req.params);
    const categoryData = updateCategoryRequestSchema.parse(req.body);

    // Update the category
    const category = await categoryService.update(id, userId, categoryData);

    logger.info('Category updated successfully', {
      id,
      userId,
      name: category.name,
      type: category.type,
    });

    res.status(200).json({
      category,
      message: 'Category updated successfully',
    });
  } catch (error) {
    if (error instanceof Error && 
        (error.message === 'Category not found or access denied' ||
         error.message === 'Category not found or access denied')) {
      logger.warn('Category update failed - not found or unauthorized', {
        categoryId: req.params.id,
        userId: req.userId,
        path: req.path,
        method: req.method,
      });

      res.status(404).json({
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    if (error instanceof Error && error.message === 'Category with this name and type already exists') {
      logger.warn('Category update failed - duplicate name', {
        categoryId: req.params.id,
        userId: req.userId,
        name: req.body.name,
        type: req.body.type,
        path: req.path,
        method: req.method,
      });

      res.status(409).json({
        error: 'Category already exists',
        code: 'DUPLICATE_CATEGORY',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        details: [
          {
            field: 'name',
            message: 'Category with this name and type already exists',
          },
        ],
      });
      return;
    }

    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('Category update failed - validation error', {
        error: error.message,
        userId: req.userId,
        path: req.path,
        method: req.method,
      });

      res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        details: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    logger.error('Update category failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      categoryId: req.params.id,
      userId: req.userId,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Failed to update category',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
}

/**
 * Delete a category
 * DELETE /api/v1/categories/:id
 */
export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (attached by auth middleware)
    const userId = req.userId;

    if (!userId) {
      logger.warn('Delete category failed - no user ID in request', {
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Validate request parameters
    const { id } = categoryIdParamSchema.parse(req.params);

    // Delete the category
    await categoryService.delete(id, userId);

    logger.info('Category deleted successfully', {
      id,
      userId,
    });

    res.status(200).json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && 
        (error.message === 'Category not found or access denied' ||
         error.message === 'Category not found or access denied')) {
      logger.warn('Category deletion failed - not found or unauthorized', {
        categoryId: req.params.id,
        userId: req.userId,
        path: req.path,
        method: req.method,
      });

      res.status(404).json({
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    if (error instanceof Error && error.message === 'Cannot delete category with existing transactions') {
      logger.warn('Category deletion failed - has transactions', {
        categoryId: req.params.id,
        userId: req.userId,
        path: req.path,
        method: req.method,
      });

      res.status(409).json({
        error: 'Cannot delete category with existing transactions',
        code: 'CATEGORY_HAS_TRANSACTIONS',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('Category deletion failed - validation error', {
        error: error.message,
        userId: req.userId,
        path: req.path,
        method: req.method,
      });

      res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        details: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    logger.error('Delete category failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      categoryId: req.params.id,
      userId: req.userId,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Failed to delete category',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
}

/**
 * Get a single category by ID
 * GET /api/v1/categories/:id
 */
export async function getCategory(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (attached by auth middleware)
    const userId = req.userId;

    if (!userId) {
      logger.warn('Get category failed - no user ID in request', {
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    // Validate request parameters
    const { id } = categoryIdParamSchema.parse(req.params);

    // Get the category
    const category = await categoryService.findById(id, userId);

    if (!category) {
      logger.warn('Get category failed - not found or unauthorized', {
        categoryId: id,
        userId,
        path: req.path,
        method: req.method,
      });

      res.status(404).json({
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    logger.info('Category retrieved successfully', {
      id,
      userId,
      name: category.name,
      type: category.type,
    });

    res.status(200).json({
      category,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('Get category failed - validation error', {
        error: error.message,
        userId: req.userId,
        path: req.path,
        method: req.method,
      });

      res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        details: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    logger.error('Get category failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      categoryId: req.params.id,
      userId: req.userId,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Failed to retrieve category',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
}