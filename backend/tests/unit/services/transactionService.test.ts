/**
 * Unit tests for transaction service
 * Tests all business logic and validation for transactions
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { TransactionService } from '../../../src/services/transactionService';
import { TransactionRepository } from '../../../src/repositories/transactionRepository';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock the transaction repository
jest.mock('../../../src/repositories/transactionRepository');

// Mock the logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Mock the validation utilities
jest.mock('../../../src/utils/validation', () => ({
  validateDateNotFuture: jest.fn(),
  validateCategoryTypeMatch: jest.fn()
}));

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: jest.Mocked<TransactionRepository>;
  let mockValidateDateNotFuture: jest.MockedFunction<typeof import('../../../src/utils/validation').validateDateNotFuture>;
  let mockValidateCategoryTypeMatch: jest.MockedFunction<typeof import('../../../src/utils/validation').validateCategoryTypeMatch>;

  beforeEach(() => {
    service = new TransactionService();
    mockRepository = TransactionRepository.prototype as jest.Mocked<TransactionRepository>;
    mockValidateDateNotFuture = require('../../../src/utils/validation').validateDateNotFuture;
    mockValidateCategoryTypeMatch = require('../../../src/utils/validation').validateCategoryTypeMatch;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    const userId = 'user-123';
    const transactionData = {
      amount: 100.50,
      categoryId: 'category-123',
      date: new Date('2024-01-15'),
      type: 'EXPENSE' as const,
      note: 'Test transaction'
    };

    const mockCategory = {
      id: 'category-123',
      name: 'Groceries',
      type: 'EXPENSE' as const
    };

    const mockTransaction = {
      id: 'transaction-123',
      userId,
      ...transactionData,
      type: 'EXPENSE' as TransactionType,
      amount: new Decimal(transactionData.amount),
      createdAt: new Date(),
      updatedAt: new Date(),
      category: mockCategory
    };

    it('should create a transaction successfully', async () => {
      mockRepository.findCategoryById.mockResolvedValue(mockCategory);
      mockRepository.create.mockResolvedValue(mockTransaction);
      mockValidateDateNotFuture.mockReturnValue(new Date());
      mockValidateCategoryTypeMatch.mockReturnValue();

      const result = await service.create(userId, transactionData);

      expect(mockValidateDateNotFuture).toHaveBeenCalledWith('2024-01-15');
      expect(mockValidateCategoryTypeMatch).toHaveBeenCalledWith('EXPENSE', 'EXPENSE');
      expect(mockRepository.findCategoryById).toHaveBeenCalledWith('category-123');
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...transactionData,
        userId
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should reject transaction with zero amount', async () => {
      const invalidData = { ...transactionData, amount: 0 };

      await expect(service.create(userId, invalidData)).rejects.toThrow('Amount must be greater than 0');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should reject transaction with negative amount', async () => {
      const invalidData = { ...transactionData, amount: -50 };

      await expect(service.create(userId, invalidData)).rejects.toThrow('Amount must be greater than 0');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should reject transaction with future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const invalidData = { ...transactionData, date: futureDate };

      mockValidateDateNotFuture.mockImplementation(() => {
        throw new Error('Date cannot be in the future');
      });

      await expect(service.create(userId, invalidData)).rejects.toThrow('Date cannot be in the future');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should reject transaction with non-existent category', async () => {
      mockRepository.findCategoryById.mockResolvedValue(null);
      mockValidateDateNotFuture.mockReturnValue(new Date());

      await expect(service.create(userId, transactionData)).rejects.toThrow('Category not found');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should reject transaction with mismatched category type', async () => {
      const incomeCategory = { ...mockCategory, type: 'INCOME' as const };
      mockRepository.findCategoryById.mockResolvedValue(incomeCategory);
      mockValidateDateNotFuture.mockReturnValue(new Date());
      mockValidateCategoryTypeMatch.mockImplementation(() => {
        throw new Error('Category type must match transaction type');
      });

      await expect(service.create(userId, transactionData)).rejects.toThrow('Category type must match transaction type');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      mockRepository.findCategoryById.mockResolvedValue(mockCategory);
      mockRepository.create.mockRejectedValue(new Error('Database error'));
      mockValidateDateNotFuture.mockReturnValue(new Date());
      mockValidateCategoryTypeMatch.mockReturnValue();

      await expect(service.create(userId, transactionData)).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    const userId = 'user-123';
    const transactionId = 'transaction-123';
    const mockTransaction = {
      id: transactionId,
      userId,
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

    it('should find transaction by ID for owner', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction);

      const result = await service.findById(transactionId, userId);

      expect(mockRepository.findById).toHaveBeenCalledWith(transactionId);
      expect(result).toEqual(mockTransaction);
    });

    it('should return null for non-owner', async () => {
      const otherUserId = 'user-456';
      const otherUserTransaction = { ...mockTransaction, userId: otherUserId };
      mockRepository.findById.mockResolvedValue(otherUserTransaction);

      const result = await service.findById(transactionId, userId);

      expect(result).toBeNull();
    });

    it('should return null for non-existent transaction', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findById(transactionId, userId);

      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(service.findById(transactionId, userId)).rejects.toThrow('Failed to find transaction');
    });
  });

  describe('findByUser', () => {
    const userId = 'user-123';
    const filters = {
      type: 'EXPENSE' as const,
      page: 1,
      limit: 20
    };

    const mockResult = {
      transactions: [
        {
          id: 'transaction-1',
          userId,
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
        }
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1
    };

    it('should find transactions for user', async () => {
      mockRepository.findByUserId.mockResolvedValue(mockResult);

      const result = await service.findByUser(userId, filters);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(mockResult);
    });

    it('should handle repository errors', async () => {
      mockRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      await expect(service.findByUser(userId, filters)).rejects.toThrow('Failed to find transactions');
    });
  });

  describe('update', () => {
    const userId = 'user-123';
    const transactionId = 'transaction-123';
    const updateData = {
            amount: 150,
            categoryId: 'category-456',
            date: new Date('2024-01-20'),
            type: 'INCOME' as const,
            note: 'Updated transaction'
          };

    const mockCategory = {
      id: 'category-456',
      name: 'Salary',
      type: 'INCOME' as const
    };

    const mockTransaction = {
      id: transactionId,
      userId,
      ...updateData,
      type: 'INCOME' as TransactionType,
      amount: new Decimal(updateData.amount),
      createdAt: new Date(),
      updatedAt: new Date(),
      category: mockCategory
    } as any;

    it('should update transaction successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction);
      mockRepository.findCategoryById.mockResolvedValue(mockCategory);
      mockRepository.update.mockResolvedValue(mockTransaction);
      mockValidateDateNotFuture.mockReturnValue(new Date());
      mockValidateCategoryTypeMatch.mockReturnValue();

      const result = await service.update(transactionId, userId, updateData);

      expect(mockRepository.findById).toHaveBeenCalledWith(transactionId);
      expect(mockValidateDateNotFuture).toHaveBeenCalledWith('2024-01-20');
      expect(mockValidateCategoryTypeMatch).toHaveBeenCalledWith('INCOME', 'INCOME');
      expect(mockRepository.findCategoryById).toHaveBeenCalledWith('category-456');
      expect(mockRepository.update).toHaveBeenCalledWith(transactionId, updateData);
      expect(result).toEqual(mockTransaction);
    });

    it('should reject update for non-existent transaction', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(transactionId, userId, updateData)).rejects.toThrow('Transaction not found or access denied');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should reject update with zero amount', async () => {
      const invalidData = { ...updateData, amount: 0 };
      mockRepository.findById.mockResolvedValue(mockTransaction);

      await expect(service.update(transactionId, userId, invalidData)).rejects.toThrow('Amount must be greater than 0');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction);
      mockRepository.findCategoryById.mockResolvedValue(mockCategory);
      mockRepository.update.mockRejectedValue(new Error('Database error'));
      mockValidateDateNotFuture.mockReturnValue(new Date());
      mockValidateCategoryTypeMatch.mockReturnValue();

      await expect(service.update(transactionId, userId, updateData)).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    const userId = 'user-123';
    const transactionId = 'transaction-123';
    const mockTransaction = {
      id: transactionId,
      userId,
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

    it('should delete transaction successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete(transactionId, userId);

      expect(mockRepository.findById).toHaveBeenCalledWith(transactionId);
      expect(mockRepository.delete).toHaveBeenCalledWith(transactionId);
    });

    it('should reject delete for non-existent transaction', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(transactionId, userId)).rejects.toThrow('Transaction not found or access denied');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction);
      mockRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.delete(transactionId, userId)).rejects.toThrow('Database error');
    });
  });

  describe('getSummary', () => {
    const userId = 'user-123';
    const filters = {
      type: 'EXPENSE' as const
    };

    const mockSummary = {
      totalIncome: 1000,
      totalExpenses: 500,
      balance: 500,
      transactionCount: 10
    };

    it('should get transaction summary', async () => {
      mockRepository.getSummary.mockResolvedValue(mockSummary);

      const result = await service.getSummary(userId, filters);

      expect(mockRepository.getSummary).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(mockSummary);
    });

    it('should handle repository errors', async () => {
      mockRepository.getSummary.mockRejectedValue(new Error('Database error'));

      await expect(service.getSummary(userId, filters)).rejects.toThrow('Failed to get transaction summary');
    });
  });

  describe('getMonthlySummary', () => {
    const userId = 'user-123';
    const months = 6;

    const mockMonthlySummary = [
      {
        month: '2024-01',
        income: 2000,
        expenses: 1500,
        balance: 500,
        transactionCount: 15
      },
      {
        month: '2024-02',
        income: 1800,
        expenses: 1200,
        balance: 600,
        transactionCount: 12
      }
    ];

    it('should get monthly summary', async () => {
      mockRepository.getMonthlySummary.mockResolvedValue(mockMonthlySummary);

      const result = await service.getMonthlySummary(userId, months);

      expect(mockRepository.getMonthlySummary).toHaveBeenCalledWith(userId, months);
      expect(result).toEqual(mockMonthlySummary);
    });

    it('should use default months when not provided', async () => {
      mockRepository.getMonthlySummary.mockResolvedValue(mockMonthlySummary);

      await service.getMonthlySummary(userId);

      expect(mockRepository.getMonthlySummary).toHaveBeenCalledWith(userId, 12);
    });

    it('should handle repository errors', async () => {
      mockRepository.getMonthlySummary.mockRejectedValue(new Error('Database error'));

      await expect(service.getMonthlySummary(userId, months)).rejects.toThrow('Failed to get monthly transaction summary');
    });
  });

  describe('validateCategoryType', () => {
    const categoryId = 'category-123';
    const userId = 'user-123';
    const type = 'EXPENSE' as const;

    const mockCategory = {
      id: categoryId,
      name: 'Groceries',
      type: 'EXPENSE' as const
    };

    it('should validate matching category type', async () => {
      mockRepository.findCategoryById.mockResolvedValue(mockCategory);

      const result = await service.validateCategoryType(categoryId, userId, type);

      expect(mockRepository.findCategoryById).toHaveBeenCalledWith(categoryId);
      expect(result).toBe(true);
    });

    it('should return false for non-matching category type', async () => {
      const incomeCategory = { ...mockCategory, type: 'INCOME' as const };
      mockRepository.findCategoryById.mockResolvedValue(incomeCategory);

      const result = await service.validateCategoryType(categoryId, userId, type);

      expect(result).toBe(false);
    });

    it('should return false for non-existent category', async () => {
      mockRepository.findCategoryById.mockResolvedValue(null);

      const result = await service.validateCategoryType(categoryId, userId, type);

      expect(result).toBe(false);
    });

    it('should handle repository errors', async () => {
      mockRepository.findCategoryById.mockRejectedValue(new Error('Database error'));

      const result = await service.validateCategoryType(categoryId, userId, type);

      expect(result).toBe(false);
    });
  });

  describe('calculateBalance', () => {
    const userId = 'user-123';
    const filters = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    };

    const mockSummary = {
      totalIncome: 2000,
      totalExpenses: 1500,
      balance: 500,
      transactionCount: 20
    };

    it('should calculate balance', async () => {
      mockRepository.getSummary.mockResolvedValue(mockSummary);

      const result = await service.calculateBalance(userId, filters);

      expect(mockRepository.getSummary).toHaveBeenCalledWith(userId, filters);
      expect(result).toBe(500);
    });

    it('should handle repository errors', async () => {
      mockRepository.getSummary.mockRejectedValue(new Error('Database error'));

      await expect(service.calculateBalance(userId, filters)).rejects.toThrow('Failed to calculate balance');
    });
  });

  describe('getTransactionsByDateRange', () => {
    const userId = 'user-123';
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';
    const filters = {
      type: 'EXPENSE' as const
    };

    const mockResult = {
      transactions: [
        {
          id: 'transaction-1',
          userId,
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
        }
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1
    };

    it('should get transactions by date range', async () => {
      mockRepository.findByUserId.mockResolvedValue(mockResult);

      const result = await service.getTransactionsByDateRange(userId, startDate, endDate, filters);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId, {
        ...filters,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle repository errors', async () => {
      mockRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      await expect(service.getTransactionsByDateRange(userId, startDate, endDate, filters)).rejects.toThrow('Failed to get transactions by date range');
    });
  });
});