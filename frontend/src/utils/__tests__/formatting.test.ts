/**
 * Unit tests for formatting utilities
 */

import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDateForInput,
  formatMonth,
  formatMonthDisplay,
  formatNumber,
  formatPercentage,
  truncateText,
  formatTransactionType,
  formatCategoryType,
  getAmountClass,
  formatRelativeTime
} from '../formatting';

describe('formatCurrency', () => {
  it('should format currency with default settings', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format currency with different currency', () => {
    expect(formatCurrency(1234.56, 'EUR')).toContain('1,234.56');
  });

  it('should format zero amount', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format large amounts', () => {
    expect(formatCurrency(999999.99)).toBe('$999,999.99');
  });
});

describe('formatDate', () => {
  it('should format date string', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
  });

  it('should format date object', () => {
    const date = new Date(2024, 0, 15);
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });

  it('should handle invalid date', () => {
    expect(formatDate('invalid')).toBe('Invalid date');
  });

  it('should use custom options', () => {
    expect(formatDate('2024-01-15', 'en-US', { year: 'numeric', month: 'long' }))
      .toBe('January 2024');
  });
});

describe('formatDateTime', () => {
  it('should format date with time', () => {
    const date = '2024-01-15T14:30:00';
    expect(formatDateTime(date)).toMatch(/Jan 15, 2024.*2:30/);
  });
});

describe('formatDateForInput', () => {
  it('should format date for input field', () => {
    const date = new Date(2024, 0, 15);
    expect(formatDateForInput(date)).toBe('2024-01-15');
  });

  it('should handle date string', () => {
    expect(formatDateForInput('2024-01-15T14:30:00')).toBe('2024-01-15');
  });

  it('should handle invalid date', () => {
    expect(formatDateForInput('invalid')).toBe('');
  });
});

describe('formatMonth', () => {
  it('should format month', () => {
    const date = new Date(2024, 0, 15);
    expect(formatMonth(date)).toBe('2024-01');
  });

  it('should handle date string', () => {
    expect(formatMonth('2024-01-15')).toBe('2024-01');
  });
});

describe('formatMonthDisplay', () => {
  it('should format month for display', () => {
    expect(formatMonthDisplay('2024-01')).toBe('January 2024');
  });

  it('should handle invalid month', () => {
    expect(formatMonthDisplay('invalid')).toBe('Invalid month');
  });
});

describe('formatNumber', () => {
  it('should format number with thousands separator', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should format decimal number', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });
});

describe('formatPercentage', () => {
  it('should format percentage', () => {
    expect(formatPercentage(0.25)).toBe('25.0%');
  });

  it('should format with custom decimals', () => {
    expect(formatPercentage(0.25, 2)).toBe('25.00%');
  });
});

describe('truncateText', () => {
  it('should truncate long text', () => {
    expect(truncateText('This is a very long text', 10)).toBe('This is...');
  });

  it('should not truncate short text', () => {
    expect(truncateText('Short', 10)).toBe('Short');
  });

  it('should use custom suffix', () => {
    expect(truncateText('This is a very long text', 10, '***')).toBe('This is***');
  });
});

describe('formatTransactionType', () => {
  it('should format income type', () => {
    expect(formatTransactionType('income')).toBe('Income');
  });

  it('should format expense type', () => {
    expect(formatTransactionType('expense')).toBe('Expense');
  });
});

describe('formatCategoryType', () => {
  it('should format income type', () => {
    expect(formatCategoryType('income')).toBe('Income');
  });

  it('should format expense type', () => {
    expect(formatCategoryType('expense')).toBe('Expense');
  });
});

describe('getAmountClass', () => {
  it('should return positive class for income', () => {
    expect(getAmountClass('income')).toBe('amount-positive');
  });

  it('should return negative class for expense', () => {
    expect(getAmountClass('expense')).toBe('amount-negative');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show "Just now" for current time', () => {
    expect(formatRelativeTime('2024-01-15T12:00:00')).toBe('Just now');
  });

  it('should show minutes ago', () => {
    expect(formatRelativeTime('2024-01-15T11:30:00')).toBe('30 minutes ago');
  });

  it('should show hours ago', () => {
    expect(formatRelativeTime('2024-01-15T08:00:00')).toBe('4 hours ago');
  });

  it('should show days ago', () => {
    expect(formatRelativeTime('2024-01-13T12:00:00')).toBe('2 days ago');
  });

  it('should show formatted date for older dates', () => {
    expect(formatRelativeTime('2024-01-01T12:00:00')).toBe('Jan 1, 2024');
  });
});