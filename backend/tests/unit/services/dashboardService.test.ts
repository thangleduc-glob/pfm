/**
 * Unit tests for dashboard service
 * Tests all financial calculations and business logic for dashboard
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { DashboardService } from '../../../src/services/dashboardService';
import { TransactionRepository } from '../../../src/repositories/transactionRepository';

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

describe('DashboardService', () => {
  let service: DashboardService;
  let mockRepository: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    service = new DashboardService();
    mockRepository = TransactionRepository.prototype as jest.Mocked<TransactionRepository>;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getDashboardData', () => {
    const userId = 'user-123';

    it('should return dashboard data with correct calculations', async () => {
      // Mock all-time summary
      const mockAllTimeSummary = {
        totalIncome: 5000,
        totalExpenses: 3000,
        balance: 2000,
        transactionCount: 25
      };
      mockRepository.getSummary.mockResolvedValueOnce(mockAllTimeSummary);

      // Mock current month summary
      const mockCurrentMonthSummary = {
        totalIncome: 3000,
        totalExpenses: 1500,
        balance: 1500,
        transactionCount: 10
      };
      mockRepository.getSummary.mockResolvedValueOnce(mockCurrentMonthSummary);

      const result = await service.getDashboardData(userId);

      expect(result).toEqual({
        currentBalance: 2000,
        currentMonthIncome: 3000,
        currentMonthExpenses: 1500,
        remainingAmount: 1500
      });

      expect(mockRepository.getSummary).toHaveBeenCalledTimes(2);
      expect(mockRepository.getSummary).toHaveBeenCalledWith(userId, {});
      expect(mockRepository.getSummary).toHaveBeenCalledWith(userId, {
        startDate: expect.any(Date),
        endDate: expect.any(Date)
      });
    });

    it('should handle zero values correctly', async () => {
      // Mock all-time summary with no transactions
      const mockAllTimeSummary = {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0
      };
      mockRepository.getSummary.mockResolvedValueOnce(mockAllTimeSummary);

      // Mock current month summary with no transactions
      const mockCurrentMonthSummary = {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0
      };
      mockRepository.getSummary.mockResolvedValueOnce(mockCurrentMonthSummary);

      const result = await service.getDashboardData(userId);

      expect(result).toEqual({
        currentBalance: 0,
        currentMonthIncome: 0,
        currentMonthExpenses: 0,
        remainingAmount: 0
      });
    });

    it('should handle negative balance correctly', async () => {
      // Mock all-time summary with expenses > income
      const mockAllTimeSummary = {
        totalIncome: 2000,
        totalExpenses: 3000,
        balance: -1000,
        transactionCount: 15
      };
      mockRepository.getSummary.mockResolvedValueOnce(mockAllTimeSummary);

      // Mock current month summary with expenses > income
      const mockCurrentMonthSummary = {
        totalIncome: 1000,
        totalExpenses: 1500,
        balance: -500,
        transactionCount: 5
      };
      mockRepository.getSummary.mockResolvedValueOnce(mockCurrentMonthSummary);

      const result = await service.getDashboardData(userId);

      expect(result).toEqual({
        currentBalance: -1000,
        currentMonthIncome: 1000,
        currentMonthExpenses: 1500,
        remainingAmount: -500
      });
    });

    it('should log error when repository fails', async () => {
      const error = new Error('Database error');
      mockRepository.getSummary.mockRejectedValue(error);

      await expect(service.getDashboardData(userId)).rejects.toThrow('Database error');

      expect(mockRepository.getSummary).toHaveBeenCalled();
    });
  });

  describe('getCurrentBalance', () => {
    const userId = 'user-123';

    it('should return current balance from repository', async () => {
      const mockSummary = {
        totalIncome: 5000,
        totalExpenses: 3000,
        balance: 2000,
        transactionCount: 25
      };
      mockRepository.getSummary.mockResolvedValue(mockSummary);

      const result = await service.getCurrentBalance(userId);

      expect(result).toBe(2000);
      expect(mockRepository.getSummary).toHaveBeenCalledWith(userId, {});
    });

    it('should handle repository error', async () => {
      const error = new Error('Database error');
      mockRepository.getSummary.mockRejectedValue(error);

      await expect(service.getCurrentBalance(userId)).rejects.toThrow('Database error');
    });
  });

  describe('getCurrentMonthIncome', () => {
    const userId = 'user-123';

    it('should return current month income from repository', async () => {
      const mockSummary = {
        totalIncome: 3000,
        totalExpenses: 1500,
        balance: 1500,
        transactionCount: 10
      };
      mockRepository.getSummary.mockResolvedValue(mockSummary);

      const result = await service.getCurrentMonthIncome(userId);

      expect(result).toBe(3000);
      expect(mockRepository.getSummary).toHaveBeenCalledWith(userId, {
        startDate: expect.any(Date),
        endDate: expect.any(Date)
      });
    });

    it('should handle repository error', async () => {
      const error = new Error('Database error');
      mockRepository.getSummary.mockRejectedValue(error);

      await expect(service.getCurrentMonthIncome(userId)).rejects.toThrow('Database error');
    });
  });

  describe('getCurrentMonthExpenses', () => {
    const userId = 'user-123';

    it('should return current month expenses from repository', async () => {
      const mockSummary = {
        totalIncome: 3000,
        totalExpenses: 1500,
        balance: 1500,
        transactionCount: 10
      };
      mockRepository.getSummary.mockResolvedValue(mockSummary);

      const result = await service.getCurrentMonthExpenses(userId);

      expect(result).toBe(1500);
      expect(mockRepository.getSummary).toHaveBeenCalledWith(userId, {
        startDate: expect.any(Date),
        endDate: expect.any(Date)
      });
    });

    it('should handle repository error', async () => {
      const error = new Error('Database error');
      mockRepository.getSummary.mockRejectedValue(error);

      await expect(service.getCurrentMonthExpenses(userId)).rejects.toThrow('Database error');
    });
  });

  describe('getCurrentMonthRemaining', () => {
    const userId = 'user-123';

    it('should return current month remaining amount from repository', async () => {
      const mockSummary = {
        totalIncome: 3000,
        totalExpenses: 1500,
        balance: 1500,
        transactionCount: 10
      };
      mockRepository.getSummary.mockResolvedValue(mockSummary);

      const result = await service.getCurrentMonthRemaining(userId);

      expect(result).toBe(1500);
      expect(mockRepository.getSummary).toHaveBeenCalledWith(userId, {
        startDate: expect.any(Date),
        endDate: expect.any(Date)
      });
    });

    it('should handle negative remaining amount', async () => {
      const mockSummary = {
        totalIncome: 1000,
        totalExpenses: 1500,
        balance: -500,
        transactionCount: 8
      };
      mockRepository.getSummary.mockResolvedValue(mockSummary);

      const result = await service.getCurrentMonthRemaining(userId);

      expect(result).toBe(-500);
    });

    it('should handle repository error', async () => {
      const error = new Error('Database error');
      mockRepository.getSummary.mockRejectedValue(error);

      await expect(service.getCurrentMonthRemaining(userId)).rejects.toThrow('Database error');
    });
  });
});