/**
 * Unit tests for validation utilities
 */

import {
  validatePassword,
  validateUsername,
  validateCategory,
  validateTransaction,
  validateEmail,
  hasValidationErrors,
  getFirstValidationError
} from '../validation';

describe('validatePassword', () => {
  it('should validate a strong password', () => {
    const result = validatePassword('Password123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject password shorter than 8 characters', () => {
    const result = validatePassword('Pass1');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });

  it('should reject password without letters', () => {
    const result = validatePassword('12345678');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one letter');
  });

  it('should reject password without numbers', () => {
    const result = validatePassword('Password');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });
});

describe('validateUsername', () => {
  it('should validate a proper username', () => {
    const result = validateUsername('user123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty username', () => {
    const result = validateUsername('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Username is required');
  });

  it('should reject username shorter than 3 characters', () => {
    const result = validateUsername('ab');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Username must be at least 3 characters long');
  });

  it('should reject username with special characters', () => {
    const result = validateUsername('user@123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Username can only contain letters, numbers, and underscores');
  });
});

describe('validateCategory', () => {
  it('should validate a proper category', () => {
    const result = validateCategory('Food', 'expense');
    expect(result).toEqual({});
  });

  it('should reject empty category name', () => {
    const result = validateCategory('', 'expense');
    expect(result.name).toBe('Category name is required');
  });

  it('should reject category name too long', () => {
    const result = validateCategory('a'.repeat(51), 'expense');
    expect(result.name).toBe('Category name must be 50 characters or less');
  });

  it('should reject invalid category type', () => {
    const result = validateCategory('Food', 'invalid');
    expect(result.type).toBe('Category type must be either income or expense');
  });
});

describe('validateTransaction', () => {
  it('should validate a proper transaction', () => {
    const result = validateTransaction('100', 'cat1', '2024-01-01', 'expense');
    expect(result).toEqual({});
  });

  it('should reject invalid amount', () => {
    const result = validateTransaction('invalid', 'cat1', '2024-01-01', 'expense');
    expect(result.amount).toBe('Amount is required');
  });

  it('should reject zero amount', () => {
    const result = validateTransaction('0', 'cat1', '2024-01-01', 'expense');
    expect(result.amount).toBe('Amount must be greater than 0');
  });

  it('should reject negative amount', () => {
    const result = validateTransaction('-100', 'cat1', '2024-01-01', 'expense');
    expect(result.amount).toBe('Amount must be greater than 0');
  });

  it('should reject empty category', () => {
    const result = validateTransaction('100', '', '2024-01-01', 'expense');
    expect(result.categoryId).toBe('Category is required');
  });

  it('should reject empty date', () => {
    const result = validateTransaction('100', 'cat1', '', 'expense');
    expect(result.date).toBe('Date is required');
  });

  it('should reject future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const result = validateTransaction('100', 'cat1', futureDate.toISOString().split('T')[0], 'expense');
    expect(result.date).toBe('Date cannot be in the future');
  });

  it('should reject invalid transaction type', () => {
    const result = validateTransaction('100', 'cat1', '2024-01-01', 'invalid');
    expect(result.type).toBe('Transaction type must be either income or expense');
  });

  it('should reject note too long', () => {
    const result = validateTransaction('100', 'cat1', '2024-01-01', 'expense', 'a'.repeat(256));
    expect(result.note).toBe('Note must be 255 characters or less');
  });
});

describe('validateEmail', () => {
  it('should validate a proper email', () => {
    const result = validateEmail('test@example.com');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Email is required');
  });

  it('should reject invalid email format', () => {
    const result = validateEmail('invalid-email');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid email format');
  });
});

describe('hasValidationErrors', () => {
  it('should return true when there are errors', () => {
    const errors = { name: 'Required', email: undefined };
    expect(hasValidationErrors(errors)).toBe(true);
  });

  it('should return false when there are no errors', () => {
    const errors = { name: undefined, email: undefined };
    expect(hasValidationErrors(errors)).toBe(false);
  });

  it('should return false for empty object', () => {
    const errors = {};
    expect(hasValidationErrors(errors)).toBe(false);
  });
});

describe('getFirstValidationError', () => {
  it('should return the first error', () => {
    const errors = { name: 'Name required', email: 'Email invalid' };
    expect(getFirstValidationError(errors)).toBe('Name required');
  });

  it('should skip undefined errors', () => {
    const errors = { name: undefined, email: 'Email invalid' };
    expect(getFirstValidationError(errors)).toBe('Email invalid');
  });

  it('should return null when no errors', () => {
    const errors = { name: undefined, email: undefined };
    expect(getFirstValidationError(errors)).toBeNull();
  });
});