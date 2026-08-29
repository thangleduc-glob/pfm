/**
 * CategoryChart component
 * Displays a simple bar chart for expense categories
 */

import React from 'react';
import { ExpenseReport } from '../../../services/expenseReportService';
import styles from './CategoryChart.module.css';

/**
 * Props for CategoryChart component
 */
interface CategoryChartProps {
  report: ExpenseReport | null;
  loading?: boolean;
  error?: string | null;
}

/**
 * CategoryChart component
 */
export const CategoryChart: React.FC<CategoryChartProps> = ({ 
  report, 
  loading = false, 
  error = null 
}) => {
  if (loading) {
    return (
      <div className={styles.categoryChart}>
        <div className={styles.loading}>Loading chart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.categoryChart}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!report || report.categories.length === 0) {
    return (
      <div className={styles.categoryChart}>
        <div className={styles.emptyState}>
          <p>No data to display</p>
        </div>
      </div>
    );
  }

  // Find the maximum amount for scaling
  const maxAmount = Math.max(...report.categories.map(c => c.totalAmount));

  return (
    <div className={styles.categoryChart}>
      <h3>Expense by Category</h3>
      
      <div className={styles.chartContainer}>
        {report.categories.map((category) => {
          const barWidth = maxAmount > 0 ? (category.totalAmount / maxAmount) * 100 : 0;
          
          return (
            <div key={category.categoryId} className={styles.chartBar}>
              <div className={styles.barLabel}>
                <span className={styles.categoryName}>{category.categoryName}</span>
                <span className={styles.categoryAmount}>${category.totalAmount.toFixed(2)}</span>
              </div>
              <div className={styles.barTrack}>
                <div 
                  className={styles.barFill} 
                  style={{ width: `${barWidth}%` }}
                  title={`${category.categoryName}: $${category.totalAmount.toFixed(2)} (${category.percentage.toFixed(1)}%)`}
                />
              </div>
              <div className={styles.barPercentage}>
                {category.percentage.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
      
      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} />
          <span>Expense Amount</span>
        </div>
        <div className={styles.legendTotal}>
          Total: ${report.grandTotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;