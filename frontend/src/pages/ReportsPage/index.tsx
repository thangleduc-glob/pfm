/**
 * ReportsPage component
 * Main page for viewing expense reports and charts
 */

import React, { useState, useEffect } from 'react';
import ExpenseReport from '../../components/reports/ExpenseReport';
import CategoryChart from '../../components/reports/CategoryChart';
import PageHeader from '../../components/common/PageHeader';
import { expenseReportService, ExpenseReport as ExpenseReportType, ExpenseReportFilters } from '../../services/expenseReportService';
import styles from './ReportsPage.module.css';

/**
 * ReportsPage component
 */
export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<ExpenseReportType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpenseReportFilters>({});

  /**
   * Load expense report data
   */
  const loadExpenseReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await expenseReportService.generateExpenseReport(filters);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expense report');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters: Partial<ExpenseReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({});
  };

  // Load report on component mount and when filters change
  useEffect(() => {
    loadExpenseReport();
  }, [filters]);

  return (
    <div className={styles.reportsPage}>
      <PageHeader title="Expense Reports" />
      
      <div className={styles.filtersSection}>
        <div className={styles.filterGroup}>
          <label htmlFor="startDate">Start Date:</label>
          <input
            id="startDate"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
            className={styles.filterInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="endDate">End Date:</label>
          <input
            id="endDate"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
            className={styles.filterInput}
          />
        </div>
        
        <button
          onClick={clearFilters}
          className={styles.clearButton}
          disabled={!filters.startDate && !filters.endDate}
        >
          Clear Filters
        </button>
      </div>

      <div className={styles.reportsContainer}>
        <div className={styles.chartSection}>
          <CategoryChart report={report} loading={loading} error={error} />
        </div>
        
        <div className={styles.reportSection}>
          <ExpenseReport report={report} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;