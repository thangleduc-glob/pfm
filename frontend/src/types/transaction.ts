/**
 * Transaction-related type definitions for the frontend
 * These types define the shape of transaction data and API responses
 */

/** Base transaction interface */
export interface BaseTransaction {
  amount: number;
  categoryId: string;
  date: string;
  type: 'income' | 'expense';
  note?: string;
}

/** Transaction entity with database fields */
export interface Transaction extends BaseTransaction {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    type: 'income' | 'expense';
  };
}

/** Transaction creation request payload */
export interface CreateTransactionRequest extends BaseTransaction {}

/** Transaction update request payload */
export interface UpdateTransactionRequest extends BaseTransaction {}

/** Transaction list response */
export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

/** Transaction filter options */
export interface TransactionFilters {
  type?: 'income' | 'expense' | 'all';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/** Transaction validation errors */
export interface TransactionValidationError {
  amount?: string;
  categoryId?: string;
  date?: string;
  type?: string;
  note?: string;
}

/** Transaction summary for dashboard */
export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

/** Monthly transaction summary */
export interface MonthlySummary {
  month: string; // Format: "YYYY-MM"
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

/** Transaction with formatted values for display */
export interface DisplayTransaction extends Transaction {
  formattedAmount: string;
  formattedDate: string;
  isPositive: boolean;
}