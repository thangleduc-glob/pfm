/**
 * Category repository for data access operations
 * Handles all database interactions for category entities
 */

import { PrismaClient, Category, CategoryType } from '@prisma/client';
import {
  ICategoryRepository,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '../types/category';
import { logger } from '../utils/logger';
import { db } from '../config/database';

/**
 * Category repository implementation using Prisma ORM
 */
export class CategoryRepository implements ICategoryRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = db;
  }

  /**
   * Create a new category
   * @param data - Category data with userId
   * @returns Promise<Category> - The created category
   */
  async create(data: CreateCategoryRequest & { userId: string }): Promise<Category> {
    try {
      const category = await this.prisma.category.create({
        data: {
          ...data,
          type: data.type.toUpperCase() as CategoryType,
        },
      });

      logger.debug('Category created', {
        id: category.id,
        userId: data.userId,
        name: data.name,
        type: data.type
      });
      return category;
    } catch (error) {
      logger.error('Failed to create category', {
        userId: data.userId,
        name: data.name,
        type: data.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to create category');
    }
  }

  /**
   * Find a category by its ID
   * @param id - The category ID to search for
   * @returns Promise<Category | null> - The category, or null if not found
   */
  async findById(id: string): Promise<Category | null> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      logger.debug('Category lookup by ID', { id, found: !!category });
      return category;
    } catch (error) {
      logger.error('Failed to find category by ID', {
        id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to find category');
    }
  }

  /**
   * Find all categories for a specific user
   * @param userId - The user ID to search for
   * @returns Promise<Category[]> - Array of categories belonging to the user
   */
  async findByUserId(userId: string): Promise<Category[]> {
    try {
      const categories = await this.prisma.category.findMany({
        where: { userId },
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ],
      });

      logger.debug('Categories lookup by user ID', {
        userId,
        count: categories.length
      });
      return categories;
    } catch (error) {
      logger.error('Failed to find categories by user ID', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to find categories');
    }
  }

  /**
   * Update an existing category
   * @param id - The category ID to update
   * @param data - Updated category data
   * @returns Promise<Category> - The updated category
   */
  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: {
          ...data,
          type: data.type.toUpperCase() as CategoryType,
        },
      });

      logger.debug('Category updated', {
        id,
        name: data.name,
        type: data.type
      });
      return category;
    } catch (error) {
      logger.error('Failed to update category', {
        id,
        name: data.name,
        type: data.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to update category');
    }
  }

  /**
   * Delete a category
   * @param id - The category ID to delete
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.category.delete({
        where: { id },
      });

      logger.debug('Category deleted', { id });
    } catch (error) {
      logger.error('Failed to delete category', {
        id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to delete category');
    }
  }

  /**
   * Count the number of transactions for a category
   * @param id - The category ID to count transactions for
   * @returns Promise<number> - Number of transactions
   */
  async countTransactions(id: string): Promise<number> {
    try {
      const count = await this.prisma.transaction.count({
        where: { categoryId: id },
      });

      logger.debug('Transaction count for category', { id, count });
      return count;
    } catch (error) {
      logger.error('Failed to count transactions for category', {
        id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to count transactions');
    }
  }

  /**
   * Find a category by name and type for a specific user
   * @param userId - The user ID
   * @param name - The category name
   * @param type - The category type
   * @returns Promise<Category | null> - The category, or null if not found
   */
  async findByNameAndType(
    userId: string,
    name: string,
    type: 'INCOME' | 'EXPENSE'
  ): Promise<Category | null> {
    try {
      const category = await this.prisma.category.findFirst({
        where: {
          userId,
          name,
          type: type.toUpperCase() as CategoryType,
        },
      });

      logger.debug('Category lookup by name and type', {
        userId,
        name,
        type,
        found: !!category
      });
      return category;
    } catch (error) {
      logger.error('Failed to find category by name and type', {
        userId,
        name,
        type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to find category');
    }
  }

  /**
   * Find a category by name and type, excluding a specific ID
   * Used for update operations to check for duplicates
   * @param id - The category ID to exclude
   * @param userId - The user ID
   * @param name - The category name
   * @param type - The category type
   * @returns Promise<Category | null> - The category, or null if not found
   */
  async findByNameAndTypeExcludingId(
    id: string,
    userId: string,
    name: string,
    type: 'INCOME' | 'EXPENSE'
  ): Promise<Category | null> {
    try {
      const category = await this.prisma.category.findFirst({
        where: {
          id: { not: id },
          userId,
          name,
          type: type.toUpperCase() as CategoryType,
        },
      });

      logger.debug('Category lookup by name and type (excluding ID)', {
        id,
        userId,
        name,
        type,
        found: !!category
      });
      return category;
    } catch (error) {
      logger.error('Failed to find category by name and type (excluding ID)', {
        id,
        userId,
        name,
        type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to find category');
    }
  }
}