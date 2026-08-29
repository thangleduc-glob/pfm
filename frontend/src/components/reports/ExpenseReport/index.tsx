/**
 * ExpenseReport component
 * Displays expense categories with amounts in descending order
 */

import React from 'react';
import { ExpenseReport as ExpenseReportType, ExpenseCategoryReport } from '../../../services/expenseReportService';
import styles from './ExpenseReport.module.css';

/**
 * Props for ExpenseReport component
 */
interface ExpenseReportProps {
  report: ExpenseReportType | null;
  loading?: boolean;
  error?: string | null;
}

/**
 * Individual category row component
 */
const CategoryRow: React.FC<{ category: ExpenseCategoryReport }> = ({ category }) => {
  return (
    <div className={styles.categoryRow}>
      <div className={styles.categoryInfo}>
        <span className={styles.categoryName}>{category.categoryName}</span>
        <span className={styles.transactionCount}>
          {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
        </span>
      </div>
      <div className={styles.categoryAmount}>
        <span className={styles.amount}>${category.totalAmount.toFixed(2)}</span>
        <span className={styles.percentage}>({category.percentage.toFixed(1)}%)</span>
      </div>
    </div>
  );
};

/**
 * ExpenseReport component
 */
export const ExpenseReport: React.FC<ExpenseReportProps> = ({ 
  report, 
  loading = false, 
  error = null 
}) => {
  if (loading) {
    return (
      <div className={styles.expenseReport}>
        <div className={styles.loading}>Loading expense report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.expenseReport}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!report || report.categories.length === 0) {
    return (
      <div className={styles.expenseReport}>
        <div className={styles.emptyState}>
          <h3>No expense data</h3>
          <p>There are no expense transactions in the selected period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.expenseReport}>
      <div className={styles.reportHeader}>
        <h2>Expense Report</h2>
        <p className={styles.reportDate}>
          Generated on {new Date(report.generatedAt).toLocaleDateString()}
        </p>
      </div>

      <div className={styles.categoriesList}>
        {report.categories.map((category) => (
          <CategoryRow key={category.categoryId} category={category} />
        ))}
      </div>

      <div className={styles.grandTotal}>
        <div className={styles.totalLabel}>
          <span>Total Expenses</span>
          <span className={styles.transactionCount}>
            ({report.totalTransactions} transaction{report.totalTransactions !== 1 ? 's' : ''})
          </span>
        </div>
        <div className={styles.totalAmount}>${report.grandTotal.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default ExpenseReport;