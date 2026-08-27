/**
 * Validation utilities for frontend forms and user input
 * Implements business rules from the specification
 */

import { CategoryValidationError } from '../types/category';
import { TransactionValidationError } from '../types/transaction';

/** Password validation result */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates password according to business rules
 * - At least 8 characters long
 * - Contains at least one letter
 * - Contains at least one number
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates username format
 * - Must be non-empty
 * - Must be at least 3 characters long
 * - Can contain letters, numbers, and underscores
 */
export function validateUsername(username: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!username.trim()) {
    errors.push('Username is required');
  } else {
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates category data
 */
export function validateCategory(name: string, type: string): CategoryValidationError {
  const errors: CategoryValidationError = {};

  if (!name.trim()) {
    errors.name = 'Category name is required';
  } else if (name.length > 50) {
    errors.name = 'Category name must be 50 characters or less';
  }

  if (!type || (type !== 'income' && type !== 'expense')) {
    errors.type = 'Category type must be either income or expense';
  }

  return errors;
}

/**
 * Validates transaction data
 */
export function validateTransaction(
  amount: string,
  categoryId: string,
  date: string,
  type: string,
  note?: string
): TransactionValidationError {
  const errors: TransactionValidationError = {};

  // Amount validation
  const amountNum = parseFloat(amount);
  if (!amount || isNaN(amountNum)) {
    errors.amount = 'Amount is required';
  } else if (amountNum <= 0) {
    errors.amount = 'Amount must be greater than 0';
  } else if (amountNum > 999999999.99) {
    errors.amount = 'Amount is too large';
  }

  // Category validation
  if (!categoryId) {
    errors.categoryId = 'Category is required';
  }

  // Date validation
  if (!date) {
    errors.date = 'Date is required';
  } else {
    const transactionDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (transactionDate > today) {
      errors.date = 'Date cannot be in the future';
    }
  }

  // Type validation
  if (!type || (type !== 'income' && type !== 'expense')) {
    errors.type = 'Transaction type must be either income or expense';
  }

  // Note validation (optional)
  if (note && note.length > 255) {
    errors.note = 'Note must be 255 characters or less';
  }

  return errors;
}

/**
 * Validates email format (for future use)
 */
export function validateEmail(email: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!email.trim()) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Checks if a form has any validation errors
 */
export function hasValidationErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(error => error !== undefined && error !== '');
}

/**
 * Gets the first error message from validation errors
 */
export function getFirstValidationError(errors: Record<string, string | undefined>): string | null {
  for (const error of Object.values(errors)) {
    if (error) {
      return error;
    }
  }
  return null;
}