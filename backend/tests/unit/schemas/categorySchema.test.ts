/**
 * Unit tests for category schemas
 */

import {
  createCategoryRequestSchema,
  updateCategoryRequestSchema,
  categoryIdParamSchema,
  categoryResponseSchema,
  categoryListResponseSchema,
  categoryWithTransactionCountResponseSchema,
  categoryAlreadyExistsErrorSchema,
  categoryNotFoundErrorSchema,
  categoryHasTransactionsErrorSchema,
} from '../../../src/schemas/categorySchema';

describe('Category Schemas', () => {
  describe('Request Schemas', () => {
    describe('createCategoryRequestSchema', () => {
      it('should validate valid create category request', () => {
        const validData = {
          name: 'Salary',
          type: 'income',
        };

        const result = createCategoryRequestSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should validate valid expense category', () => {
        const validData = {
          name: 'Groceries',
          type: 'expense',
        };

        const result = createCategoryRequestSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject empty name', () => {
        const invalidData = {
          name: '',
          type: 'income',
        };

        expect(() => createCategoryRequestSchema.parse(invalidData)).toThrow(
          'Category name is required'
        );
      });

      it('should reject name too long', () => {
        const invalidData = {
          name: 'a'.repeat(51),
          type: 'income',
        };

        expect(() => createCategoryRequestSchema.parse(invalidData)).toThrow(
          'Category name must be 50 characters or less'
        );
      });

      it('should reject invalid characters in name', () => {
        const invalidData = {
          name: 'Salary@#$',
          type: 'income',
        };

        expect(() => createCategoryRequestSchema.parse(invalidData)).toThrow(
          'Category name can only contain letters, numbers, spaces, hyphens, and underscores'
        );
      });

      it('should reject invalid type', () => {
        const invalidData = {
          name: 'Salary',
          type: 'invalid',
        };

        expect(() => createCategoryRequestSchema.parse(invalidData)).toThrow(
          'Category type must be either income or expense'
        );
      });

      it('should accept name with spaces and hyphens', () => {
        const validData = {
          name: 'Home - Rent',
          type: 'expense',
        };

        const result = createCategoryRequestSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should accept name with underscores', () => {
        const validData = {
          name: 'Freelance_Income',
          type: 'income',
        };

        const result = createCategoryRequestSchema.parse(validData);
        expect(result).toEqual(validData);
      });
    });

    describe('updateCategoryRequestSchema', () => {
      it('should validate valid update category request', () => {
        const validData = {
          name: 'Updated Salary',
          type: 'income',
        };

        const result = updateCategoryRequestSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject empty name', () => {
        const invalidData = {
          name: '',
          type: 'expense',
        };

        expect(() => updateCategoryRequestSchema.parse(invalidData)).toThrow(
          'Category name is required'
        );
      });
    });

    describe('categoryIdParamSchema', () => {
      it('should validate valid UUID', () => {
        const validData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
        };

        const result = categoryIdParamSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject invalid UUID format', () => {
        const invalidData = {
          id: 'invalid-uuid',
        };

        expect(() => categoryIdParamSchema.parse(invalidData)).toThrow(
          'Invalid category ID format'
        );
      });

      it('should reject empty ID', () => {
        const invalidData = {
          id: '',
        };

        expect(() => categoryIdParamSchema.parse(invalidData)).toThrow(
          'Invalid category ID format'
        );
      });
    });
  });

  describe('Response Schemas', () => {
    describe('categoryResponseSchema', () => {
      it('should validate valid category response', () => {
        const validData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Salary',
          type: 'income',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = categoryResponseSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject invalid type', () => {
        const invalidData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Salary',
          type: 'invalid',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(() => categoryResponseSchema.parse(invalidData)).toThrow();
      });
    });

    describe('categoryListResponseSchema', () => {
      it('should validate empty category list', () => {
        const validData: any[] = [];

        const result = categoryListResponseSchema.parse(validData);
        expect(result).toEqual([]);
      });

      it('should validate category list with items', () => {
        const validData = [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            userId: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Salary',
            type: 'income',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174002',
            userId: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Groceries',
            type: 'expense',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const result = categoryListResponseSchema.parse(validData);
        expect(result).toHaveLength(2);
      });
    });

    describe('categoryWithTransactionCountResponseSchema', () => {
      it('should validate category with transaction count', () => {
        const validData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Salary',
          type: 'income',
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            transactions: 5,
          },
        };

        const result = categoryWithTransactionCountResponseSchema.parse(validData);
        expect(result._count.transactions).toBe(5);
      });

      it('should validate category with zero transactions', () => {
        const validData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Salary',
          type: 'income',
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            transactions: 0,
          },
        };

        const result = categoryWithTransactionCountResponseSchema.parse(validData);
        expect(result._count.transactions).toBe(0);
      });
    });
  });

  describe('Error Schemas', () => {
    describe('categoryAlreadyExistsErrorSchema', () => {
      it('should validate category already exists error', () => {
        const validData = {
          error: 'Category with this name and type already exists',
          code: 'DUPLICATE_CATEGORY' as const,
          timestamp: new Date(),
          path: '/api/v1/categories',
          method: 'POST',
          details: [
            {
              field: 'name',
              message: 'Category name already exists for this type',
            },
          ],
        };

        const result = categoryAlreadyExistsErrorSchema.parse(validData);
        expect(result.code).toBe('DUPLICATE_CATEGORY');
        expect(result.details).toHaveLength(1);
      });
    });

    describe('categoryNotFoundErrorSchema', () => {
      it('should validate category not found error', () => {
        const validData = {
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND' as const,
          timestamp: new Date(),
          path: '/api/v1/categories/123',
          method: 'GET',
        };

        const result = categoryNotFoundErrorSchema.parse(validData);
        expect(result.code).toBe('CATEGORY_NOT_FOUND');
      });
    });

    describe('categoryHasTransactionsErrorSchema', () => {
      it('should validate category has transactions error', () => {
        const validData = {
          error: 'Cannot delete category with existing transactions',
          code: 'CATEGORY_HAS_TRANSACTIONS' as const,
          timestamp: new Date(),
          path: '/api/v1/categories/123',
          method: 'DELETE',
        };

        const result = categoryHasTransactionsErrorSchema.parse(validData);
        expect(result.code).toBe('CATEGORY_HAS_TRANSACTIONS');
      });
    });
  });
});