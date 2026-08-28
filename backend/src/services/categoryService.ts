/**
 * Category service for business logic and validation
 * Handles category operations with business rule enforcement
 */

import { 
  ICategoryService, 
  ICategoryRepository,
  CreateCategoryRequest, 
  UpdateCategoryRequest
} from '../types/category';
import { Category } from '@prisma/client';
import { logger } from '../utils/logger';
import { CategoryRepository } from '../repositories/categoryRepository';

/**
 * Category service implementation with business logic
 */
export class CategoryService implements ICategoryService {
  private repository: ICategoryRepository;

  constructor(repository?: ICategoryRepository) {
    this.repository = repository || new CategoryRepository();
  }

  /**
   * Create a new category with validation
   * @param userId - The user ID creating the category
   * @param data - Category creation data
   * @returns Promise<Category> - The created category
   * @throws Error if category name already exists for the user
   */
  async create(userId: string, data: CreateCategoryRequest): Promise<Category> {
    // Validate that category name is unique for the user and type
    const existingCategory = await this.repository.findByNameAndType(
      userId, 
      data.name, 
      data.type
    );

    if (existingCategory) {
      logger.warn('Category creation failed - duplicate name', {
        userId,
        name: data.name,
        type: data.type,
        existingId: existingCategory.id
      });
      throw new Error('Category with this name and type already exists');
    }

    // Create the category
    const category = await this.repository.create({
      ...data,
      userId,
    });

    logger.info('Category created successfully', {
      id: category.id,
      userId,
      name: data.name,
      type: data.type
    });

    return category;
  }

  /**
   * Find a category by ID with user ownership validation
   * @param id - The category ID to find
   * @param userId - The user ID requesting the category
   * @returns Promise<Category | null> - The category if found and owned by user
   */
  async findById(id: string, userId: string): Promise<Category | null> {
    const category = await this.repository.findById(id);

    // Validate user ownership
    if (category && category.userId !== userId) {
      logger.warn('Unauthorized category access attempt', {
        categoryId: id,
        requestedUserId: userId,
        actualUserId: category.userId
      });
      return null;
    }

    logger.debug('Category lookup by ID', { 
      id, 
      userId, 
      found: !!category 
    });

    return category;
  }

  /**
   * Find all categories for a user
   * @param userId - The user ID to find categories for
   * @returns Promise<Category[]> - Array of user's categories
   */
  async findByUser(userId: string): Promise<Category[]> {
    const categories = await this.repository.findByUserId(userId);

    logger.debug('Categories retrieved for user', {
      userId,
      count: categories.length
    });

    return categories;
  }

  /**
   * Update a category with validation
   * @param id - The category ID to update
   * @param userId - The user ID updating the category
   * @param data - Updated category data
   * @returns Promise<Category> - The updated category
   * @throws Error if category not found, not owned by user, or name already exists
   */
  async update(
    id: string, 
    userId: string, 
    data: UpdateCategoryRequest
  ): Promise<Category> {
    // First, verify the category exists and is owned by the user
    const existingCategory = await this.findById(id, userId);
    if (!existingCategory) {
      logger.warn('Category update failed - not found or unauthorized', {
        id,
        userId
      });
      throw new Error('Category not found or access denied');
    }

    // Check if the new name/type combination would create a duplicate
    const duplicateCategory = await this.repository.findByNameAndTypeExcludingId(
      id,
      userId,
      data.name,
      data.type
    );

    if (duplicateCategory) {
      logger.warn('Category update failed - duplicate name', {
        id,
        userId,
        name: data.name,
        type: data.type,
        duplicateId: duplicateCategory.id
      });
      throw new Error('Category with this name and type already exists');
    }

    // Update the category
    const updatedCategory = await this.repository.update(id, data);

    logger.info('Category updated successfully', {
      id,
      userId,
      oldName: existingCategory.name,
      newName: data.name,
      oldType: existingCategory.type,
      newType: data.type
    });

    return updatedCategory;
  }

  /**
   * Delete a category with validation
   * @param id - The category ID to delete
   * @param userId - The user ID deleting the category
   * @returns Promise<void>
   * @throws Error if category not found, not owned by user, or has transactions
   */
  async delete(id: string, userId: string): Promise<void> {
    // First, verify the category exists and is owned by the user
    const existingCategory = await this.findById(id, userId);
    if (!existingCategory) {
      logger.warn('Category deletion failed - not found or unauthorized', {
        id,
        userId
      });
      throw new Error('Category not found or access denied');
    }

    // Check if category has transactions
    const hasTransactions = await this.hasTransactions(id, userId);
    if (hasTransactions) {
      logger.warn('Category deletion failed - has transactions', {
        id,
        userId,
        categoryName: existingCategory.name
      });
      throw new Error('Cannot delete category with existing transactions');
    }

    // Delete the category
    await this.repository.delete(id);

    logger.info('Category deleted successfully', {
      id,
      userId,
      categoryName: existingCategory.name
    });
  }

  /**
   * Check if a category exists by name and type for a user
   * @param userId - The user ID
   * @param name - The category name
   * @param type - The category type
   * @returns Promise<boolean> - True if category exists
   */
  async existsByName(
    userId: string, 
    name: string, 
    type: 'income' | 'expense'
  ): Promise<boolean> {
    const category = await this.repository.findByNameAndType(userId, name, type);
    return !!category;
  }

  /**
   * Check if a category exists by name and type for a user (excluding specific ID)
   * Used for update operations
   * @param id - The category ID to exclude
   * @param userId - The user ID
   * @param name - The category name
   * @param type - The category type
   * @returns Promise<boolean> - True if category exists
   */
  async existsByNameForUpdate(
    id: string,
    userId: string, 
    name: string, 
    type: 'income' | 'expense'
  ): Promise<boolean> {
    const category = await this.repository.findByNameAndTypeExcludingId(
      id, 
      userId, 
      name, 
      type
    );
    return !!category;
  }

  /**
   * Check if a category has transactions
   * @param id - The category ID
   * @param userId - The user ID (for ownership validation)
   * @returns Promise<boolean> - True if category has transactions
   */
  async hasTransactions(id: string, userId: string): Promise<boolean> {
    // First verify ownership
    const category = await this.findById(id, userId);
    if (!category) {
      throw new Error('Category not found or access denied');
    }

    const transactionCount = await this.repository.countTransactions(id);
    return transactionCount > 0;
  }
}