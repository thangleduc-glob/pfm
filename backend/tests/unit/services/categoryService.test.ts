/**
 * Unit tests for CategoryService
 */

import { Category, CategoryType } from '@prisma/client';
import { CategoryService } from '../../../src/services/categoryService';
import { ICategoryRepository } from '../../../src/types/category';

// Mock the logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CategoryService', () => {
  let service: CategoryService;
  let mockRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countTransactions: jest.fn(),
      findByNameAndType: jest.fn(),
      findByNameAndTypeExcludingId: jest.fn(),
    } as jest.Mocked<ICategoryRepository>;

    service = new CategoryService(mockRepository);
    jest.clearAllMocks();
  });

  const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
    id: 'category-123',
    userId: 'user-123',
    name: 'Salary',
    type: 'INCOME' as CategoryType,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const userId = 'user-123';
      const categoryData = {
        name: 'Salary',
        type: 'income' as const,
      };

      const expectedCategory = createMockCategory({
        userId,
        name: 'Salary',
        type: 'INCOME',
      });

      mockRepository.findByNameAndType.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(expectedCategory);

      const result = await service.create(userId, categoryData);

      expect(mockRepository.findByNameAndType).toHaveBeenCalledWith(userId, 'Salary', 'income');
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...categoryData,
        userId,
      });
      expect(result).toEqual(expectedCategory);
    });

    it('should throw error when category name already exists', async () => {
      const userId = 'user-123';
      const categoryData = {
        name: 'Salary',
        type: 'income' as const,
      };

      const existingCategory = createMockCategory({
        userId,
        name: 'Salary',
        type: 'INCOME',
      });

      mockRepository.findByNameAndType.mockResolvedValue(existingCategory);

      await expect(service.create(userId, categoryData)).rejects.toThrow(
        'Category with this name and type already exists'
      );

      expect(mockRepository.findByNameAndType).toHaveBeenCalledWith(userId, 'Salary', 'income');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const userId = 'user-123';
      const categoryData = {
        name: 'Salary',
        type: 'income' as const,
      };

      mockRepository.findByNameAndType.mockResolvedValue(null);
      mockRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(userId, categoryData)).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return category when found and owned by user', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const expectedCategory = createMockCategory({ userId });

      mockRepository.findById.mockResolvedValue(expectedCategory);

      const result = await service.findById(categoryId, userId);

      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(expectedCategory);
    });

    it('should return null when category not found', async () => {
      const userId = 'user-123';
      const categoryId = 'nonexistent-category';

      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findById(categoryId, userId);

      expect(result).toBeNull();
    });

    it('should return null when category is owned by different user', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const otherUserCategory = createMockCategory({ userId: 'other-user-456' });

      mockRepository.findById.mockResolvedValue(otherUserCategory);

      const result = await service.findById(categoryId, userId);

      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';

      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(service.findById(categoryId, userId)).rejects.toThrow('Database error');
    });
  });

  describe('findByUser', () => {
    it('should return all categories for a user', async () => {
      const userId = 'user-123';
      const expectedCategories = [
        createMockCategory({ userId, name: 'Salary', type: 'INCOME' }),
        createMockCategory({ 
          userId, 
          id: 'category-456', 
          name: 'Groceries', 
          type: 'EXPENSE' 
        }),
      ];

      mockRepository.findByUserId.mockResolvedValue(expectedCategories);

      const result = await service.findByUser(userId);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedCategories);
    });

    it('should return empty array when user has no categories', async () => {
      const userId = 'user-123';

      mockRepository.findByUserId.mockResolvedValue([]);

      const result = await service.findByUser(userId);

      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      const userId = 'user-123';

      mockRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      await expect(service.findByUser(userId)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update category successfully', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const updateData = {
        name: 'Updated Salary',
        type: 'income' as const,
      };

      const existingCategory = createMockCategory({ userId });
      const updatedCategory = createMockCategory({
        ...existingCategory,
        name: 'Updated Salary',
      });

      mockRepository.findById.mockResolvedValue(existingCategory);
      mockRepository.findByNameAndTypeExcludingId.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(updatedCategory);

      const result = await service.update(categoryId, userId, updateData);

      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.findByNameAndTypeExcludingId).toHaveBeenCalledWith(
        categoryId, userId, 'Updated Salary', 'income'
      );
      expect(mockRepository.update).toHaveBeenCalledWith(categoryId, updateData);
      expect(result).toEqual(updatedCategory);
    });

    it('should throw error when category not found', async () => {
      const userId = 'user-123';
      const categoryId = 'nonexistent-category';
      const updateData = {
        name: 'Updated Salary',
        type: 'income' as const,
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(categoryId, userId, updateData)).rejects.toThrow(
        'Category not found or access denied'
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when category is owned by different user', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const updateData = {
        name: 'Updated Salary',
        type: 'income' as const,
      };

      const otherUserCategory = createMockCategory({ userId: 'other-user-456' });

      mockRepository.findById.mockResolvedValue(otherUserCategory);

      await expect(service.update(categoryId, userId, updateData)).rejects.toThrow(
        'Category not found or access denied'
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when new name/type combination already exists', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const updateData = {
        name: 'Existing Category',
        type: 'income' as const,
      };

      const existingCategory = createMockCategory({ userId });
      const duplicateCategory = createMockCategory({
        id: 'category-456',
        name: 'Existing Category',
        type: 'INCOME',
      });

      mockRepository.findById.mockResolvedValue(existingCategory);
      mockRepository.findByNameAndTypeExcludingId.mockResolvedValue(duplicateCategory);

      await expect(service.update(categoryId, userId, updateData)).rejects.toThrow(
        'Category with this name and type already exists'
      );

      expect(mockRepository.findByNameAndTypeExcludingId).toHaveBeenCalledWith(
        categoryId, userId, 'Existing Category', 'income'
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const updateData = {
        name: 'Updated Salary',
        type: 'income' as const,
      };

      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(service.update(categoryId, userId, updateData)).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('should delete category successfully', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const existingCategory = createMockCategory({ userId });

      mockRepository.findById.mockResolvedValue(existingCategory);
      mockRepository.countTransactions.mockResolvedValue(0);
      mockRepository.delete.mockResolvedValue(undefined as any);

      await service.delete(categoryId, userId);

      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.countTransactions).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('should throw error when category not found', async () => {
      const userId = 'user-123';
      const categoryId = 'nonexistent-category';

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(categoryId, userId)).rejects.toThrow(
        'Category not found or access denied'
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error when category is owned by different user', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const otherUserCategory = createMockCategory({ userId: 'other-user-456' });

      mockRepository.findById.mockResolvedValue(otherUserCategory);

      await expect(service.delete(categoryId, userId)).rejects.toThrow(
        'Category not found or access denied'
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error when category has transactions', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const existingCategory = createMockCategory({ userId });

      mockRepository.findById.mockResolvedValue(existingCategory);
      mockRepository.countTransactions.mockResolvedValue(5);

      await expect(service.delete(categoryId, userId)).rejects.toThrow(
        'Cannot delete category with existing transactions'
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.countTransactions).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';

      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(service.delete(categoryId, userId)).rejects.toThrow('Database error');
    });
  });

  describe('existsByName', () => {
    it('should return true when category exists', async () => {
      const userId = 'user-123';
      const name = 'Salary';
      const type = 'income' as const;

      const existingCategory = createMockCategory({ userId, name, type: 'INCOME' });

      mockRepository.findByNameAndType.mockResolvedValue(existingCategory);

      const result = await service.existsByName(userId, name, type);

      expect(result).toBe(true);
      expect(mockRepository.findByNameAndType).toHaveBeenCalledWith(userId, name, type);
    });

    it('should return false when category does not exist', async () => {
      const userId = 'user-123';
      const name = 'Nonexistent';
      const type = 'income' as const;

      mockRepository.findByNameAndType.mockResolvedValue(null);

      const result = await service.existsByName(userId, name, type);

      expect(result).toBe(false);
      expect(mockRepository.findByNameAndType).toHaveBeenCalledWith(userId, name, type);
    });
  });

  describe('existsByNameForUpdate', () => {
    it('should return true when category exists excluding current ID', async () => {
      const excludeId = 'category-123';
      const userId = 'user-123';
      const name = 'Salary';
      const type = 'income' as const;

      const existingCategory = createMockCategory({
        id: 'category-456',
        userId,
        name,
        type: 'INCOME',
      });

      mockRepository.findByNameAndTypeExcludingId.mockResolvedValue(existingCategory);

      const result = await service.existsByNameForUpdate(excludeId, userId, name, type);

      expect(result).toBe(true);
      expect(mockRepository.findByNameAndTypeExcludingId).toHaveBeenCalledWith(
        excludeId, userId, name, type
      );
    });

    it('should return false when no duplicate category exists', async () => {
      const excludeId = 'category-123';
      const userId = 'user-123';
      const name = 'Unique';
      const type = 'income' as const;

      mockRepository.findByNameAndTypeExcludingId.mockResolvedValue(null);

      const result = await service.existsByNameForUpdate(excludeId, userId, name, type);

      expect(result).toBe(false);
      expect(mockRepository.findByNameAndTypeExcludingId).toHaveBeenCalledWith(
        excludeId, userId, name, type
      );
    });
  });

  describe('hasTransactions', () => {
    it('should return true when category has transactions', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const existingCategory = createMockCategory({ userId });

      mockRepository.findById.mockResolvedValue(existingCategory);
      mockRepository.countTransactions.mockResolvedValue(5);

      const result = await service.hasTransactions(categoryId, userId);

      expect(result).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.countTransactions).toHaveBeenCalledWith(categoryId);
    });

    it('should return false when category has no transactions', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const existingCategory = createMockCategory({ userId });

      mockRepository.findById.mockResolvedValue(existingCategory);
      mockRepository.countTransactions.mockResolvedValue(0);

      const result = await service.hasTransactions(categoryId, userId);

      expect(result).toBe(false);
      expect(mockRepository.countTransactions).toHaveBeenCalledWith(categoryId);
    });

    it('should throw error when category not found', async () => {
      const userId = 'user-123';
      const categoryId = 'nonexistent-category';

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.hasTransactions(categoryId, userId)).rejects.toThrow(
        'Category not found or access denied'
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.countTransactions).not.toHaveBeenCalled();
    });

    it('should throw error when category is owned by different user', async () => {
      const userId = 'user-123';
      const categoryId = 'category-123';
      const otherUserCategory = createMockCategory({ userId: 'other-user-456' });

      mockRepository.findById.mockResolvedValue(otherUserCategory);

      await expect(service.hasTransactions(categoryId, userId)).rejects.toThrow(
        'Category not found or access denied'
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.countTransactions).not.toHaveBeenCalled();
    });
  });
});