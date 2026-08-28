/**
 * Unit tests for CategoryRepository
 */

import { Category, CategoryType } from '@prisma/client';
import { CategoryRepository } from '../../../src/repositories/categoryRepository';

// Mock the database module
jest.mock('../../../src/config/database', () => ({
  db: {
    category: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
    },
  },
}));

// Mock the logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let mockDb: any;

  beforeEach(() => {
    repository = new CategoryRepository();
    mockDb = require('../../../src/config/database').db;
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const userId = 'user-123';
      const categoryData = {
        userId,
        name: 'Salary',
        type: 'income' as const,
      };

      const expectedCategory: Category = {
        id: 'category-123',
        userId,
        name: 'Salary',
        type: 'INCOME' as CategoryType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.category.create.mockResolvedValue(expectedCategory);

      const result = await repository.create(categoryData);

      expect(mockDb.category.create).toHaveBeenCalledWith({
        data: {
          ...categoryData,
          type: 'INCOME',
        },
      });
      expect(result).toEqual(expectedCategory);
    });

    it('should handle create errors', async () => {
      const categoryData = {
        userId: 'user-123',
        name: 'Salary',
        type: 'income' as const,
      };

      mockDb.category.create.mockRejectedValue(new Error('Database error'));

      await expect(repository.create(categoryData)).rejects.toThrow('Failed to create category');
      expect(mockDb.category.create).toHaveBeenCalledWith({
        data: {
          ...categoryData,
          type: 'INCOME',
        },
      });
    });
  });

  describe('findById', () => {
    it('should find a category by ID', async () => {
      const categoryId = 'category-123';
      const expectedCategory: Category = {
        id: categoryId,
        userId: 'user-123',
        name: 'Salary',
        type: 'INCOME' as CategoryType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.category.findUnique.mockResolvedValue(expectedCategory);

      const result = await repository.findById(categoryId);

      expect(mockDb.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(result).toEqual(expectedCategory);
    });

    it('should return null when category not found', async () => {
      const categoryId = 'nonexistent-category';

      mockDb.category.findUnique.mockResolvedValue(null);

      const result = await repository.findById(categoryId);

      expect(mockDb.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(result).toBeNull();
    });

    it('should handle find errors', async () => {
      const categoryId = 'category-123';

      mockDb.category.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(repository.findById(categoryId)).rejects.toThrow('Failed to find category');
    });
  });

  describe('findByUserId', () => {
    it('should find all categories for a user', async () => {
      const userId = 'user-123';
      const expectedCategories: Category[] = [
        {
          id: 'category-1',
          userId,
          name: 'Salary',
          type: 'INCOME' as CategoryType,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'category-2',
          userId,
          name: 'Groceries',
          type: 'EXPENSE' as CategoryType,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.category.findMany.mockResolvedValue(expectedCategories);

      const result = await repository.findByUserId(userId);

      expect(mockDb.category.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ],
      });
      expect(result).toEqual(expectedCategories);
    });

    it('should return empty array when user has no categories', async () => {
      const userId = 'user-123';

      mockDb.category.findMany.mockResolvedValue([]);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual([]);
    });

    it('should handle find errors', async () => {
      const userId = 'user-123';

      mockDb.category.findMany.mockRejectedValue(new Error('Database error'));

      await expect(repository.findByUserId(userId)).rejects.toThrow('Failed to find categories');
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const categoryId = 'category-123';
      const updateData = {
        name: 'Updated Salary',
        type: 'income' as const,
      };

      const expectedCategory: Category = {
        id: categoryId,
        userId: 'user-123',
        name: 'Updated Salary',
        type: 'INCOME' as CategoryType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.category.update.mockResolvedValue(expectedCategory);

      const result = await repository.update(categoryId, updateData);

      expect(mockDb.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: {
          ...updateData,
          type: 'INCOME',
        },
      });
      expect(result).toEqual(expectedCategory);
    });

    it('should handle update errors', async () => {
      const categoryId = 'category-123';
      const updateData = {
        name: 'Updated Salary',
        type: 'income' as const,
      };

      mockDb.category.update.mockRejectedValue(new Error('Database error'));

      await expect(repository.update(categoryId, updateData)).rejects.toThrow('Failed to update category');
    });
  });

  describe('delete', () => {
    it('should delete a category successfully', async () => {
      const categoryId = 'category-123';

      mockDb.category.delete.mockResolvedValue(undefined as any);

      await repository.delete(categoryId);

      expect(mockDb.category.delete).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });

    it('should handle delete errors', async () => {
      const categoryId = 'category-123';

      mockDb.category.delete.mockRejectedValue(new Error('Database error'));

      await expect(repository.delete(categoryId)).rejects.toThrow('Failed to delete category');
    });
  });

  describe('countTransactions', () => {
    it('should count transactions for a category', async () => {
      const categoryId = 'category-123';
      const expectedCount = 5;

      mockDb.transaction.count.mockResolvedValue(expectedCount);

      const result = await repository.countTransactions(categoryId);

      expect(mockDb.transaction.count).toHaveBeenCalledWith({
        where: { categoryId },
      });
      expect(result).toBe(expectedCount);
    });

    it('should return 0 when no transactions exist', async () => {
      const categoryId = 'category-123';

      mockDb.transaction.count.mockResolvedValue(0);

      const result = await repository.countTransactions(categoryId);

      expect(result).toBe(0);
    });

    it('should handle count errors', async () => {
      const categoryId = 'category-123';

      mockDb.transaction.count.mockRejectedValue(new Error('Database error'));

      await expect(repository.countTransactions(categoryId)).rejects.toThrow('Failed to count transactions');
    });
  });

  describe('findByNameAndType', () => {
    it('should find category by name and type', async () => {
      const userId = 'user-123';
      const name = 'Salary';
      const type = 'income' as const;

      const expectedCategory: Category = {
        id: 'category-123',
        userId,
        name,
        type: 'INCOME' as CategoryType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.category.findFirst.mockResolvedValue(expectedCategory);

      const result = await repository.findByNameAndType(userId, name, type);

      expect(mockDb.category.findFirst).toHaveBeenCalledWith({
        where: {
          userId,
          name,
          type: 'INCOME',
        },
      });
      expect(result).toEqual(expectedCategory);
    });

    it('should return null when category not found', async () => {
      const userId = 'user-123';
      const name = 'Nonexistent';
      const type = 'income' as const;

      mockDb.category.findFirst.mockResolvedValue(null);

      const result = await repository.findByNameAndType(userId, name, type);

      expect(result).toBeNull();
    });

    it('should handle find errors', async () => {
      const userId = 'user-123';
      const name = 'Salary';
      const type = 'income' as const;

      mockDb.category.findFirst.mockRejectedValue(new Error('Database error'));

      await expect(repository.findByNameAndType(userId, name, type)).rejects.toThrow('Failed to find category');
    });
  });

  describe('findByNameAndTypeExcludingId', () => {
    it('should find category by name and type excluding ID', async () => {
      const excludeId = 'category-123';
      const userId = 'user-123';
      const name = 'Salary';
      const type = 'income' as const;

      const expectedCategory: Category = {
        id: 'category-456',
        userId,
        name,
        type: 'INCOME' as CategoryType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.category.findFirst.mockResolvedValue(expectedCategory);

      const result = await repository.findByNameAndTypeExcludingId(excludeId, userId, name, type);

      expect(mockDb.category.findFirst).toHaveBeenCalledWith({
        where: {
          id: { not: excludeId },
          userId,
          name,
          type: 'INCOME',
        },
      });
      expect(result).toEqual(expectedCategory);
    });

    it('should return null when no matching category found', async () => {
      const excludeId = 'category-123';
      const userId = 'user-123';
      const name = 'Unique';
      const type = 'income' as const;

      mockDb.category.findFirst.mockResolvedValue(null);

      const result = await repository.findByNameAndTypeExcludingId(excludeId, userId, name, type);

      expect(result).toBeNull();
    });

    it('should handle find errors', async () => {
      const excludeId = 'category-123';
      const userId = 'user-123';
      const name = 'Salary';
      const type = 'income' as const;

      mockDb.category.findFirst.mockRejectedValue(new Error('Database error'));

      await expect(repository.findByNameAndTypeExcludingId(excludeId, userId, name, type))
        .rejects.toThrow('Failed to find category');
    });
  });
});