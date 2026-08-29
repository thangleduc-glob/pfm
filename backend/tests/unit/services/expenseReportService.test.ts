/**
 * Unit tests for ExpenseReportService
 * Tests the business logic for expense report generation
 */

import { ExpenseReportService } from '../../../src/services/expenseReportService';
import { TransactionRepository } from '../../../src/repositories/transactionRepository';
import { TransactionWithCategory } from '../../../src/types/transaction';

// Mock the TransactionRepository
jest.mock('../../../src/repositories/transactionRepository');

describe('ExpenseReportService', () => {
  let expenseReportService: ExpenseReportService;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create service instance
    expenseReportService = new ExpenseReportService();
    
    // Get mocked repository instance
    mockTransactionRepository = TransactionRepository.prototype as jest.Mocked<TransactionRepository>;
  });

  describe('generateExpenseReport', () => {
    const userId = 'test-user-id';
    
    // Mock Decimal object
    const createMockDecimal = (value: number) => ({
      toNumber: () => value,
      toString: () => value.toString(),
      equals: (other: any) => other?.toNumber?.() === value
    });
    
    const mockTransactions: TransactionWithCategory[] = [
      {
        id: '1',
        userId,
        categoryId: 'cat-1',
        amount: createMockDecimal(100.00) as any,
        type: 'EXPENSE',
        date: new Date('2024-01-15'),
        note: 'Test expense 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'cat-1',
          name: 'Food',
          type: 'EXPENSE'
        }
      },
      {
        id: '2',
        userId,
        categoryId: 'cat-1',
        amount: createMockDecimal(50.00) as any,
        type: 'EXPENSE',
        date: new Date('2024-01-16'),
        note: 'Test expense 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'cat-1',
          name: 'Food',
          type: 'EXPENSE'
        }
      },
      {
        id: '3',
        userId,
        categoryId: 'cat-2',
        amount: createMockDecimal(200.00) as any,
        type: 'EXPENSE',
        date: new Date('2024-01-17'),
        note: 'Test expense 3',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'cat-2',
          name: 'Transport',
          type: 'EXPENSE'
        }
      }
    ];

    it('should generate expense report grouped by category', async () => {
      // Mock repository response
      mockTransactionRepository.findByUserId.mockResolvedValue({
        transactions: mockTransactions,
        total: 3,
        page: 1,
        limit: 10000,
        totalPages: 1
      });

      // Generate report
      const report = await expenseReportService.generateExpenseReport(userId);

      // Verify repository was called correctly
      expect(mockTransactionRepository.findByUserId).toHaveBeenCalledWith(userId, {
        type: 'EXPENSE',
        page: 1,
        limit: 10000
      });

      // Verify report structure
      expect(report).toHaveProperty('categories');
      expect(report).toHaveProperty('grandTotal');
      expect(report).toHaveProperty('totalTransactions');
      expect(report).toHaveProperty('generatedAt');

      // Verify categories are sorted by total amount (highest first)
      expect(report.categories).toHaveLength(2);
      expect(report.categories[0].categoryName).toBe('Transport');
      expect(report.categories[0].totalAmount).toBe(200.00);
      expect(report.categories[1].categoryName).toBe('Food');
      expect(report.categories[1].totalAmount).toBe(150.00);

      // Verify grand total
      expect(report.grandTotal).toBe(350.00);

      // Verify transaction count
      expect(report.totalTransactions).toBe(3);

      // Verify percentages
      expect(report.categories[0].percentage).toBe((200.00 / 350.00) * 100);
      expect(report.categories[1].percentage).toBe((150.00 / 350.00) * 100);
    });

    it('should filter by date range', async () => {
      const filters = {
        startDate: new Date('2024-01-16'),
        endDate: new Date('2024-01-17')
      };

      // Mock repository response
      mockTransactionRepository.findByUserId.mockResolvedValue({
        transactions: mockTransactions.slice(1), // Exclude first transaction
        total: 2,
        page: 1,
        limit: 10000,
        totalPages: 1
      });

      // Generate report with filters
      const report = await expenseReportService.generateExpenseReport(userId, filters);

      // Verify repository was called with filters
      expect(mockTransactionRepository.findByUserId).toHaveBeenCalledWith(userId, {
        type: 'EXPENSE',
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: 1,
        limit: 10000
      });

      // Verify filtered results
      expect(report.categories).toHaveLength(2);
      expect(report.grandTotal).toBe(250.00); // 50 + 200
      expect(report.totalTransactions).toBe(2);
    });

    it('should filter by category IDs', async () => {
      const filters = {
        categoryIds: ['cat-1']
      };

      // Mock repository response
      mockTransactionRepository.findByUserId.mockResolvedValue({
        transactions: mockTransactions,
        total: 3,
        page: 1,
        limit: 10000,
        totalPages: 1
      });

      // Generate report with filters
      const report = await expenseReportService.generateExpenseReport(userId, filters);

      // Verify only specified category is included
      expect(report.categories).toHaveLength(1);
      expect(report.categories[0].categoryId).toBe('cat-1');
      expect(report.categories[0].totalAmount).toBe(150.00);
      expect(report.grandTotal).toBe(150.00);
      expect(report.totalTransactions).toBe(2);
    });

    it('should handle empty transactions', async () => {
      // Mock empty response
      mockTransactionRepository.findByUserId.mockResolvedValue({
        transactions: [],
        total: 0,
        page: 1,
        limit: 10000,
        totalPages: 1
      });

      // Generate report
      const report = await expenseReportService.generateExpenseReport(userId);

      // Verify empty report
      expect(report.categories).toHaveLength(0);
      expect(report.grandTotal).toBe(0);
      expect(report.totalTransactions).toBe(0);
    });

    it('should handle repository errors', async () => {
      // Mock repository error
      mockTransactionRepository.findByUserId.mockRejectedValue(
        new Error('Database error')
      );

      // Verify error is thrown
      await expect(expenseReportService.generateExpenseReport(userId))
        .rejects.toThrow('Failed to generate expense report');
    });
  });
});