/**
 * Transaction-related type definitions for the backend
 * These types define the shape of transaction data and internal interfaces
 */

import { Transaction } from '@prisma/client';

/** Base transaction interface */
export interface BaseTransaction {
  amount: number;
  categoryId: string;
  date: Date;
  type: 'income' | 'expense';
  note?: string;
}

/** Transaction creation request payload */
export interface CreateTransactionRequest extends BaseTransaction {}

/** Transaction update request payload */
export interface UpdateTransactionRequest extends BaseTransaction {}

/** Transaction with category information */
export interface TransactionWithCategory extends Transaction {
  category: {
    id: string;
    name: string;
    type: 'income' | 'expense';
  };
}

/** Transaction with user and category information */
export interface TransactionWithRelations extends Transaction {
  user: {
    id: string;
    username: string;
  };
  category: {
    id: string;
    name: string;
    type: 'income' | 'expense';
  };
}

/** Transaction filter options */
export interface TransactionFilters {
  type?: 'income' | 'expense';
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

/** Transaction list result with pagination */
export interface TransactionListResult {
  transactions: TransactionWithCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Transaction summary data */
export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

/** Monthly transaction summary */
export interface MonthlyTransactionSummary {
  month: string; // Format: "YYYY-MM"
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

/** Transaction service interface */
export interface ITransactionService {
  create(userId: string, data: CreateTransactionRequest): Promise<TransactionWithCategory>;
  findById(id: string, userId: string): Promise<TransactionWithCategory | null>;
  findByUser(userId: string, filters?: TransactionFilters): Promise<TransactionListResult>;
  update(id: string, userId: string, data: UpdateTransactionRequest): Promise<TransactionWithCategory>;
  delete(id: string, userId: string): Promise<void>;
  getSummary(userId: string, filters?: Omit<TransactionFilters, 'page' | 'limit'>): Promise<TransactionSummary>;
  getMonthlySummary(userId: string, months?: number): Promise<MonthlyTransactionSummary[]>;
  validateCategoryType(categoryId: string, userId: string, type: 'income' | 'expense'): Promise<boolean>;
}

/** Transaction repository interface */
export interface ITransactionRepository {
  create(data: CreateTransactionRequest & { userId: string }): Promise<TransactionWithCategory>;
  findById(id: string): Promise<TransactionWithCategory | null>;
  findByUserId(userId: string, filters?: TransactionFilters): Promise<TransactionListResult>;
  update(id: string, data: UpdateTransactionRequest): Promise<TransactionWithCategory>;
  delete(id: string): Promise<void>;
  getSummary(userId: string, filters?: Omit<TransactionFilters, 'page' | 'limit'>): Promise<TransactionSummary>;
  getMonthlySummary(userId: string, months?: number): Promise<MonthlyTransactionSummary[]>;
  findCategoryById(categoryId: string): Promise<{ id: string; name: string; type: 'income' | 'expense' } | null>;
}