/**
 * Unit tests for backend validation utilities
 */

import {
  VALIDATION_PATTERNS,
  usernameSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  createCategorySchema,
  createTransactionSchema,
  transactionFilterSchema,
  validateDateNotFuture,
  validateCategoryTypeMatch,
  isPasswordStrong,
  isValidUsername,
  isValidCategoryName,
  isValidAmount,
  sanitizeString,
  sanitizeSearchQuery
} from '../validation';

describe('VALIDATION_PATTERNS', () => {
  it('should validate username pattern', () => {
    expect(VALIDATION_PATTERNS.username.test('user123')).toBe(true);
    expect(VALIDATION_PATTERNS.username.test('user_123')).toBe(true);
    expect(VALIDATION_PATTERNS.username.test('user@123')).toBe(false);
    expect(VALIDATION_PATTERNS.username.test('us')).toBe(false);
  });

  it('should validate password pattern', () => {
    expect(VALIDATION_PATTERNS.password.test('Password123')).toBe(true);
    expect(VALIDATION_PATTERNS.password.test('password')).toBe(false);
    expect(VALIDATION_PATTERNS.password.test('12345678')).toBe(false);
    expect(VALIDATION_PATTERNS.password.test('Pass1')).toBe(false);
  });

  it('should validate category name pattern', () => {
    expect(VALIDATION_PATTERNS.categoryName.test('Food')).toBe(true);
    expect(VALIDATION_PATTERNS.categoryName.test('')).toBe(false);
    expect(VALIDATION_PATTERNS.categoryName.test('a'.repeat(51))).toBe(false); // Pattern limits to 50 chars
  });

  it('should validate amount pattern', () => {
    expect(VALIDATION_PATTERNS.amount.test('100')).toBe(true);
    expect(VALIDATION_PATTERNS.amount.test('100.50')).toBe(true);
    expect(VALIDATION_PATTERNS.amount.test('0.50')).toBe(true); // Leading zero is allowed
    expect(VALIDATION_PATTERNS.amount.test('-100')).toBe(false);
  });

  it('should validate date pattern', () => {
    expect(VALIDATION_PATTERNS.date.test('2024-01-15')).toBe(true);
    expect(VALIDATION_PATTERNS.date.test('2024-1-15')).toBe(false);
    expect(VALIDATION_PATTERNS.date.test('15-01-2024')).toBe(false);
  });
});

describe('Schema validation', () => {
  describe('usernameSchema', () => {
    it('should validate valid username', () => {
      expect(() => usernameSchema.parse('user123')).not.toThrow();
    });

    it('should reject invalid username', () => {
      expect(() => usernameSchema.parse('us')).toThrow();
      expect(() => usernameSchema.parse('user@123')).toThrow();
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong password', () => {
      expect(() => passwordSchema.parse('Password123')).not.toThrow();
    });

    it('should reject weak password', () => {
      expect(() => passwordSchema.parse('weak')).toThrow();
      expect(() => passwordSchema.parse('12345678')).toThrow();
      expect(() => passwordSchema.parse('Password')).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate login data', () => {
      expect(() => loginSchema.parse({ username: 'user', password: 'pass' })).not.toThrow();
    });

    it('should reject empty fields', () => {
      expect(() => loginSchema.parse({ username: '', password: 'pass' })).toThrow();
      expect(() => loginSchema.parse({ username: 'user', password: '' })).toThrow();
    });
  });

  describe('registerSchema', () => {
    it('should validate registration data', () => {
      expect(() => registerSchema.parse({ username: 'user123', password: 'Password123' })).not.toThrow();
    });

    it('should reject invalid registration data', () => {
      expect(() => registerSchema.parse({ username: 'us', password: 'weak' })).toThrow();
    });
  });

  describe('createCategorySchema', () => {
    it('should validate category creation', () => {
      expect(() => createCategorySchema.parse({ name: 'Food', type: 'expense' })).not.toThrow();
    });

    it('should reject invalid category data', () => {
      expect(() => createCategorySchema.parse({ name: '', type: 'invalid' })).toThrow();
    });
  });

  describe('createTransactionSchema', () => {
    it('should validate transaction creation', () => {
      const data = {
        amount: '100',
        categoryId: 'cat1',
        date: '2024-01-15',
        type: 'expense',
        note: 'Test note'
      };
      expect(() => createTransactionSchema.parse(data)).not.toThrow();
    });

    it('should transform string amount to number', () => {
      const data = {
        amount: '100.50',
        categoryId: 'cat1',
        date: '2024-01-15',
        type: 'expense'
      };
      const result = createTransactionSchema.parse(data);
      expect(result.amount).toBe(100.50);
    });

    it('should reject invalid transaction data', () => {
      const data = {
        amount: '-100',
        categoryId: '',
        date: 'invalid',
        type: 'invalid'
      };
      expect(() => createTransactionSchema.parse(data)).toThrow();
    });
  });

  describe('transactionFilterSchema', () => {
    it('should validate filter with defaults', () => {
      const data = { type: 'expense' };
      const result = transactionFilterSchema.parse(data);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should coerce page and limit to numbers', () => {
      const data = { page: '2', limit: '10' };
      const result = transactionFilterSchema.parse(data);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });
  });
});

describe('Utility functions', () => {
  describe('validateDateNotFuture', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should validate past date', () => {
      const date = validateDateNotFuture('2024-01-10');
      expect(date).toBeInstanceOf(Date);
    });

    it('should validate today', () => {
      const date = validateDateNotFuture('2024-01-15');
      expect(date).toBeInstanceOf(Date);
    });

    it('should reject future date', () => {
      expect(() => validateDateNotFuture('2024-01-20')).toThrow('Date cannot be in the future');
    });

    it('should reject invalid date', () => {
      expect(() => validateDateNotFuture('invalid')).toThrow('Invalid date format');
    });
  });

  describe('validateCategoryTypeMatch', () => {
    it('should validate matching types', () => {
      expect(() => validateCategoryTypeMatch('income', 'income')).not.toThrow();
      expect(() => validateCategoryTypeMatch('expense', 'expense')).not.toThrow();
    });

    it('should reject mismatched types', () => {
      expect(() => validateCategoryTypeMatch('income', 'expense')).toThrow('Category type must match transaction type');
      expect(() => validateCategoryTypeMatch('expense', 'income')).toThrow('Category type must match transaction type');
    });
  });

  describe('isPasswordStrong', () => {
    it('should validate strong password', () => {
      expect(isPasswordStrong('Password123')).toBe(true);
    });

    it('should reject weak password', () => {
      expect(isPasswordStrong('weak')).toBe(false);
      expect(isPasswordStrong('12345678')).toBe(false);
      expect(isPasswordStrong('Password')).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    it('should validate valid username', () => {
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('user_123')).toBe(true);
    });

    it('should reject invalid username', () => {
      expect(isValidUsername('us')).toBe(false);
      expect(isValidUsername('user@123')).toBe(false);
    });
  });

  describe('isValidCategoryName', () => {
    it('should validate category name', () => {
      expect(isValidCategoryName('Food')).toBe(true);
      expect(isValidCategoryName('Food & Drinks')).toBe(true);
    });

    it('should reject empty name', () => {
      expect(isValidCategoryName('')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('should validate valid amount', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(100.50)).toBe(true);
    });

    it('should reject invalid amount', () => {
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount(Infinity)).toBe(false);
      expect(isValidAmount(NaN)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim and normalize whitespace', () => {
      expect(sanitizeString('  hello   world  ')).toBe('hello world');
      expect(sanitizeString('\tmultiple\t\tspaces\n')).toBe('multiple spaces');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should sanitize and limit search query', () => {
      const longQuery = 'a'.repeat(150);
      expect(sanitizeSearchQuery(longQuery)).toHaveLength(100);
    });

    it('should trim and normalize', () => {
      expect(sanitizeSearchQuery('  search  query  ')).toBe('search query');
    });
  });
});