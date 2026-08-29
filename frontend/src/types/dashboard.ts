/**
 * Dashboard-related type definitions for the frontend
 * These types define the shape of dashboard data and API responses
 */

/** Dashboard data interface */
export interface DashboardData {
  currentBalance: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  remainingAmount: number;
}

/** Dashboard API response */
export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message: string;
}

/** Dashboard component props */
export interface BalanceCardProps {
  balance: number;
  loading?: boolean;
  error?: string | null;
}

/** Monthly summary component props */
export interface MonthlySummaryProps {
  income: number;
  expenses: number;
  remaining: number;
  loading?: boolean;
  error?: string | null;
}

/** Dashboard summary component props */
export interface DashboardSummaryProps {
  data?: DashboardData | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}