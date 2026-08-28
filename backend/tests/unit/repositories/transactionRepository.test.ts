/**
 * Unit tests for transaction repository
 * Tests all data access operations for transactions
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { TransactionRepository } from '../../../src/repositories/transactionRepository';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock the database module
jest.mock('../../../src/config/database', () => ({
  db: {
    transaction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn()
    },
    category: {
      findUnique: jest.fn()
    }
  }
}));

// Mock the logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('TransactionRepository', () => {
  let repository: TransactionRepository;
  let mockDb: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    repository = new TransactionRepository();
    mockDb = require('../../../src/config/database').db as any;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a transaction successfully', async () => {
      const transactionData = {
        userId: 'user-123',
        amount: 100.50,
        categoryId: 'category-123',
        type: 'EXPENSE' as const,
        date: new Date('2024-01-15'),
        note: 'Test transaction'
      };

      const expectedTransaction = {
        id: 'transaction-123',
        ...transactionData,
        type: 'EXPENSE' as TransactionType,
        amount: new Decimal(transactionData.amount),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'category-123',
          name: 'Groceries',
          type: 'EXPENSE' as const
        }
      };

      mockDb.transaction.create.mockResolvedValue(expectedTransaction);

      const result = await repository.create(transactionData);

      expect(mockDb.transaction.create).toHaveBeenCalledWith({
        data: {
          ...transactionData,
          type: 'EXPENSE',
          amount: 100.50
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      expect(result).toEqual(expectedTransaction);
    });

    it('should handle creation errors', async () => {
      const transactionData = {
        userId: 'user-123',
        amount: 100,
        categoryId: 'category-123',
        type: 'EXPENSE' as const,
        date: new Date('2024-01-15')
      };

      mockDb.transaction.create.mockRejectedValue(new Error('Database error'));

      await expect(repository.create(transactionData)).rejects.toThrow('Failed to create transaction');
      expect(mockDb.transaction.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find a transaction by ID', async () => {
      const transactionId = 'transaction-123';
      const expectedTransaction = {
        id: transactionId,
        userId: 'user-123',
        amount: new Decimal(100),
        categoryId: 'category-123',
        type: 'EXPENSE' as TransactionType,
        date: new Date('2024-01-15'),
        note: 'Test transaction',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'category-123',
          name: 'Groceries',
          type: 'EXPENSE' as const
        }
      };

      mockDb.transaction.findUnique.mockResolvedValue(expectedTransaction);

      const result = await repository.findById(transactionId);

      expect(mockDb.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: transactionId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      expect(result).toEqual(expectedTransaction);
    });

    it('should return null when transaction not found', async () => {
      const transactionId = 'nonexistent-transaction';

      mockDb.transaction.findUnique.mockResolvedValue(null);

      const result = await repository.findById(transactionId);

      expect(result).toBeNull();
    });

    it('should handle find errors', async () => {
      const transactionId = 'transaction-123';

      mockDb.transaction.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(repository.findById(transactionId)).rejects.toThrow('Failed to find transaction');
    });
  });

  describe('findByUserId', () => {
    it('should find transactions for user with filters', async () => {
      const userId = 'user-123';
      const filters = {
        type: 'EXPENSE' as const,
        categoryId: 'category-123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        search: 'grocery',
        page: 2,
        limit: 10
      };

      const expectedTransactions = [
        {
          id: 'transaction-1',
          userId,
          amount: new Decimal(100),
          categoryId: 'category-123',
          type: 'EXPENSE' as TransactionType,
          date: new Date('2024-01-15'),
          note: 'Grocery shopping',
          createdAt: new Date(),
          updatedAt: new Date(),
          category: {
            id: 'category-123',
            name: 'Groceries',
            type: 'EXPENSE' as const
          }
        }
      ];

      const total = 25;
      const totalPages = 3;

      mockDb.transaction.count.mockResolvedValue(total);
      mockDb.transaction.findMany.mockResolvedValue(expectedTransactions);

      const result = await repository.findByUserId(userId, filters);

      expect(mockDb.transaction.count).toHaveBeenCalledWith({
        where: {
          userId,
          type: 'EXPENSE',
          categoryId: 'category-123',
          date: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31')
          },
          OR: [
            { note: { contains: 'grocery' } },
            { category: { name: { contains: 'grocery' } } }
          ]
        }
      });

      expect(mockDb.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          type: 'EXPENSE',
          categoryId: 'category-123',
          date: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31')
          },
          OR: [
            { note: { contains: 'grocery' } },
            { category: { name: { contains: 'grocery' } } }
          ]
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        },
        orderBy: [
          { date: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: 10,
        take: 10
      });

      expect(result).toEqual({
        transactions: expectedTransactions,
        total,
        page: 2,
        limit: 10,
        totalPages
      });
    });

    it('should use default pagination when not provided', async () => {
      const userId = 'user-123';

      mockDb.transaction.count.mockResolvedValue(0);
      mockDb.transaction.findMany.mockResolvedValue([]);

      await repository.findByUserId(userId);

      expect(mockDb.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20
        })
      );
    });

    it('should handle find errors', async () => {
      const userId = 'user-123';

      mockDb.transaction.count.mockRejectedValue(new Error('Database error'));

      await expect(repository.findByUserId(userId)).rejects.toThrow('Failed to find transactions');
    });
  });

  describe('update', () => {
    it('should update a transaction successfully', async () => {
      const transactionId = 'transaction-123';
      const updateData = {
        amount: 150,
        categoryId: 'category-456',
        type: 'INCOME' as const,
        date: new Date('2024-01-20'),
        note: 'Updated transaction'
      };

      const expectedTransaction = {
        id: transactionId,
        userId: 'user-123',
        ...updateData,
        type: 'INCOME' as TransactionType,
        amount: new Decimal(updateData.amount),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'category-456',
          name: 'Salary',
          type: 'INCOME' as const
        }
      };

      mockDb.transaction.update.mockResolvedValue(expectedTransaction);

      const result = await repository.update(transactionId, updateData);

      expect(mockDb.transaction.update).toHaveBeenCalledWith({
        where: { id: transactionId },
        data: {
          ...updateData,
          type: 'INCOME',
          amount: 150
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      expect(result).toEqual(expectedTransaction);
    });

    it('should handle update errors', async () => {
      const transactionId = 'transaction-123';
      const updateData = {
        amount: 150,
        categoryId: 'category-456',
        type: 'INCOME' as const,
        date: new Date('2024-01-20')
      };

      mockDb.transaction.update.mockRejectedValue(new Error('Database error'));

      await expect(repository.update(transactionId, updateData)).rejects.toThrow('Failed to update transaction');
    });
  });

  describe('delete', () => {
    it('should delete a transaction successfully', async () => {
      const transactionId = 'transaction-123';

      mockDb.transaction.delete.mockResolvedValue({} as any);

      await repository.delete(transactionId);

      expect(mockDb.transaction.delete).toHaveBeenCalledWith({
        where: { id: transactionId }
      });
    });

    it('should handle delete errors', async () => {
      const transactionId = 'transaction-123';

      mockDb.transaction.delete.mockRejectedValue(new Error('Database error'));

      await expect(repository.delete(transactionId)).rejects.toThrow('Failed to delete transaction');
    });
  });

  describe('getSummary', () => {
    it('should get transaction summary with filters', async () => {
      const userId = 'user-123';
      const filters = {
        type: 'EXPENSE' as const,
        categoryId: 'category-123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const mockAggregateResult = {
        _sum: { amount: new Decimal(500) },
        _count: { id: 5 },
        _avg: { amount: new Decimal(100) },
        _min: { amount: new Decimal(50) },
        _max: { amount: new Decimal(200) }
      };

      const mockIncomeResult = {
        _sum: { amount: new Decimal(1000) },
        _count: { id: 3 },
        _avg: { amount: new Decimal(333.33) },
        _min: { amount: new Decimal(100) },
        _max: { amount: new Decimal(500) }
      };

      const mockExpenseResult = {
        _sum: { amount: new Decimal(500) },
        _count: { id: 2 },
        _avg: { amount: new Decimal(250) },
        _min: { amount: new Decimal(200) },
        _max: { amount: new Decimal(300) }
      };

      mockDb.transaction.aggregate
        .mockResolvedValueOnce(mockAggregateResult)
        .mockResolvedValueOnce(mockIncomeResult)
        .mockResolvedValueOnce(mockExpenseResult);

      const result = await repository.getSummary(userId, filters);

      expect(result).toEqual({
        totalIncome: 1000,
        totalExpenses: 500,
        balance: 500,
        transactionCount: 5
      });

      expect(mockDb.transaction.aggregate).toHaveBeenCalledTimes(3);
    });

    it('should handle null amounts in summary', async () => {
      const userId = 'user-123';

      const mockAggregateResult = {
        _sum: { amount: null },
        _count: { id: 0 },
        _avg: { amount: null },
        _min: { amount: null },
        _max: { amount: null }
      };

      const mockIncomeResult = {
        _sum: { amount: null },
        _count: { id: 0 },
        _avg: { amount: null },
        _min: { amount: null },
        _max: { amount: null }
      };

      const mockExpenseResult = {
        _sum: { amount: null },
        _count: { id: 0 },
        _avg: { amount: null },
        _min: { amount: null },
        _max: { amount: null }
      };

      mockDb.transaction.aggregate
        .mockResolvedValueOnce(mockAggregateResult)
        .mockResolvedValueOnce(mockIncomeResult)
        .mockResolvedValueOnce(mockExpenseResult);

      const result = await repository.getSummary(userId);

      expect(result).toEqual({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0
      });
    });

    it('should handle summary errors', async () => {
      const userId = 'user-123';

      mockDb.transaction.aggregate.mockRejectedValue(new Error('Database error'));

      await expect(repository.getSummary(userId)).rejects.toThrow('Failed to get transaction summary');
    });
  });

  describe('getMonthlySummary', () => {
    it('should get monthly summary for specified months', async () => {
      const userId = 'user-123';
      const months = 6;

      const mockTransactions = [
        {
          id: 'transaction-1',
          userId: 'user-123',
          categoryId: 'category-123',
          date: new Date('2024-01-15'),
          amount: new Decimal(100),
          type: 'EXPENSE' as TransactionType,
          note: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'transaction-2',
          userId: 'user-123',
          categoryId: 'category-456',
          date: new Date('2024-01-20'),
          amount: new Decimal(200),
          type: 'INCOME' as TransactionType,
          note: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'transaction-3',
          userId: 'user-123',
          categoryId: 'category-123',
          date: new Date('2024-02-10'),
          amount: new Decimal(150),
          type: 'EXPENSE' as TransactionType,
          note: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDb.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await repository.getMonthlySummary(userId, months);

      expect(result).toHaveLength(2); // January and February
      expect(result[0]).toEqual({
        month: '2024-01',
        income: 200,
        expenses: 100,
        balance: 100,
        transactionCount: 2
      });
      expect(result[1]).toEqual({
        month: '2024-02',
        income: 0,
        expenses: 150,
        balance: -150,
        transactionCount: 1
      });

      expect(mockDb.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            gte: expect.any(Date)
          }
        },
        select: {
          date: true,
          amount: true,
          type: true
        },
        orderBy: { date: 'asc' }
      });
    });

    it('should handle monthly summary errors', async () => {
      const userId = 'user-123';

      mockDb.transaction.findMany.mockRejectedValue(new Error('Database error'));

      await expect(repository.getMonthlySummary(userId)).rejects.toThrow('Failed to get monthly transaction summary');
    });
  });

  describe('findCategoryById', () => {
    it('should find a category by ID', async () => {
      const categoryId = 'category-123';
      const expectedCategory = {
        id: categoryId,
        name: 'Groceries',
        type: 'EXPENSE' as const,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDb.category.findUnique.mockResolvedValue(expectedCategory);

      const result = await repository.findCategoryById(categoryId);

      expect(mockDb.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
        select: {
          id: true,
          name: true,
          type: true
        }
      });

      expect(result).toEqual(expectedCategory);
    });

    it('should return null when category not found', async () => {
      const categoryId = 'nonexistent-category';

      mockDb.category.findUnique.mockResolvedValue(null);

      const result = await repository.findCategoryById(categoryId);

      expect(result).toBeNull();
    });

    it('should handle category find errors', async () => {
      const categoryId = 'category-123';

      mockDb.category.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(repository.findCategoryById(categoryId)).rejects.toThrow('Failed to find category');
    });
  });
});