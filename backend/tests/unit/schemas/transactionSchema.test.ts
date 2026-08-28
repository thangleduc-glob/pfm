/**
 * Unit tests for transaction validation schemas
 * Tests all validation rules for transaction operations
 */

import { describe, it, expect } from '@jest/globals';
import {
  createTransactionRequestSchema,
  updateTransactionRequestSchema,
  transactionFilterRequestSchema,
  transactionIdSchema,
  deleteTransactionRequestSchema,
  transactionQuerySchema,
  transactionSummaryRequestSchema,
  monthlySummaryRequestSchema
} from '../../../src/schemas/transactionSchema';

describe('Transaction Schema Validation', () => {
  describe('createTransactionRequestSchema', () => {
    it('should validate valid transaction data', () => {
      const validData = {
        amount: 100.50,
        categoryId: 'category-123',
        date: '2024-01-15',
        type: 'EXPENSE',
        note: 'Test transaction'
      };

      const result = createTransactionRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid amount (zero)', () => {
      const invalidData = {
        amount: 0,
        categoryId: 'category-123',
        date: '2024-01-15',
        type: 'EXPENSE'
      };

      const result = createTransactionRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('greater than 0');
      }
    });

    it('should reject negative amount', () => {
      const invalidData = {
        amount: -50,
        categoryId: 'category-123',
        date: '2024-01-15',
        type: 'EXPENSE'
      };

      const result = createTransactionRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing category', () => {
      const invalidData = {
        amount: 100,
        date: '2024-01-15',
        type: 'EXPENSE'
      };

      const result = createTransactionRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const invalidData = {
        amount: 100,
        categoryId: 'category-123',
        date: futureDate.toISOString().split('T')[0],
        type: 'EXPENSE'
      };

      const result = createTransactionRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid transaction type', () => {
      const invalidData = {
        amount: 100,
        categoryId: 'category-123',
        date: '2024-01-15',
        type: 'INVALID'
      };

      const result = createTransactionRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept transaction without note', () => {
      const validData = {
        amount: 100,
        categoryId: 'category-123',
        date: '2024-01-15',
        type: 'INCOME'
      };

      const result = createTransactionRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept string amount that converts to number', () => {
      const validData = {
        amount: '100.50',
        categoryId: 'category-123',
        date: '2024-01-15',
        type: 'INCOME'
      };

      const result = createTransactionRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(100.50);
      }
    });
  });

  describe('updateTransactionRequestSchema', () => {
    it('should validate valid update data', () => {
      const validData = {
        amount: 200,
        categoryId: 'category-456',
        date: '2024-01-20',
        type: 'INCOME',
        note: 'Updated transaction'
      };

      const result = updateTransactionRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        amount: 100,
        categoryId: 'category-123',
        date: '20-01-2024',
        type: 'EXPENSE'
      };

      const result = updateTransactionRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('transactionFilterRequestSchema', () => {
    it('should validate empty filter', () => {
      const result = transactionFilterRequestSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should validate filter with type', () => {
      const filter = {
        type: 'INCOME',
        page: 2,
        limit: 10
      };

      const result = transactionFilterRequestSchema.safeParse(filter);
      expect(result.success).toBe(true);
    });

    it('should validate filter with date range', () => {
      const filter = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        categoryId: 'category-123'
      };

      const result = transactionFilterRequestSchema.safeParse(filter);
      expect(result.success).toBe(true);
    });

    it('should validate filter with search term', () => {
      const filter = {
        search: 'grocery',
        limit: 50
      };

      const result = transactionFilterRequestSchema.safeParse(filter);
      expect(result.success).toBe(true);
    });

    it('should reject invalid page number', () => {
      const filter = {
        page: 0
      };

      const result = transactionFilterRequestSchema.safeParse(filter);
      expect(result.success).toBe(false);
    });

    it('should reject limit over maximum', () => {
      const filter = {
        limit: 101
      };

      const result = transactionFilterRequestSchema.safeParse(filter);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format in filter', () => {
      const filter = {
        startDate: '2024/01/01'
      };

      const result = transactionFilterRequestSchema.safeParse(filter);
      expect(result.success).toBe(false);
    });
  });

  describe('transactionIdSchema', () => {
    it('should validate valid ID', () => {
      const result = transactionIdSchema.safeParse('transaction-123');
      expect(result.success).toBe(true);
    });

    it('should reject empty ID', () => {
      const result = transactionIdSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject whitespace-only ID', () => {
      const result = transactionIdSchema.safeParse('   ');
      expect(result.success).toBe(false);
    });
  });

  describe('deleteTransactionRequestSchema', () => {
    it('should validate valid delete request', () => {
      const request = {
        id: 'transaction-123'
      };

      const result = deleteTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should reject delete request without ID', () => {
      const request = {};

      const result = deleteTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('transactionQuerySchema', () => {
    it('should validate query with userId', () => {
      const query = {
        userId: 'user-123'
      };

      const result = transactionQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it('should validate query with userId and transactionId', () => {
      const query = {
        userId: 'user-123',
        transactionId: 'transaction-456'
      };

      const result = transactionQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it('should reject query without userId', () => {
      const query = {
        transactionId: 'transaction-456'
      };

      const result = transactionQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });

  describe('transactionSummaryRequestSchema', () => {
    it('should validate summary request with userId', () => {
      const request = {
        userId: 'user-123'
      };

      const result = transactionSummaryRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should validate summary request with filters', () => {
      const request = {
        userId: 'user-123',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: 'EXPENSE',
        categoryId: 'category-123'
      };

      const result = transactionSummaryRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should reject summary request without userId', () => {
      const request = {
        type: 'INCOME'
      };

      const result = transactionSummaryRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format in summary request', () => {
      const request = {
        userId: 'user-123',
        startDate: '01-01-2024'
      };

      const result = transactionSummaryRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('monthlySummaryRequestSchema', () => {
    it('should validate monthly summary request with userId', () => {
      const request = {
        userId: 'user-123'
      };

      const result = monthlySummaryRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.months).toBe(12); // Default value
      }
    });

    it('should validate monthly summary request with custom months', () => {
      const request = {
        userId: 'user-123',
        months: 6
      };

      const result = monthlySummaryRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.months).toBe(6);
      }
    });

    it('should reject monthly summary request without userId', () => {
      const request = {
        months: 6
      };

      const result = monthlySummaryRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject months less than 1', () => {
      const request = {
        userId: 'user-123',
        months: 0
      };

      const result = monthlySummaryRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject months greater than 24', () => {
      const request = {
        userId: 'user-123',
        months: 25
      };

      const result = monthlySummaryRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should accept string number for months', () => {
      const request = {
        userId: 'user-123',
        months: '6'
      };

      const result = monthlySummaryRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.months).toBe(6);
      }
    });
  });
});