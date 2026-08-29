/**
 * MonthlySummary Component
 * Displays monthly income, expenses, and remaining amount
 */

import React from 'react';
import { MonthlySummaryProps } from '../../../types/dashboard';
import { formatCurrency } from '../../../utils/formatting';
import './MonthlySummary.css';

/**
 * MonthlySummary component displays monthly financial summary
 * @param income - Current month income
 * @param expenses - Current month expenses
 * @param remaining - Remaining amount (income - expenses)
 * @param loading - Whether the data is loading
 * @param error - Error message if any
 */
const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  income,
  expenses,
  remaining,
  loading = false,
  error = null,
}) => {
  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className="monthly-summary monthly-summary--loading">
        <div className="monthly-summary__skeletons">
          <div className="monthly-summary__skeleton"></div>
          <div className="monthly-summary__skeleton"></div>
          <div className="monthly-summary__skeleton"></div>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="monthly-summary monthly-summary--error">
        <div className="monthly-summary__error-message">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="monthly-summary">
      <h3 className="monthly-summary__title">This Month</h3>
      
      <div className="monthly-summary__grid">
        <div className="monthly-summary__item">
          <div className="monthly-summary__label">Income</div>
          <div className="monthly-summary__value monthly-summary__value--income">
            +{formatCurrency(income)}
          </div>
        </div>
        
        <div className="monthly-summary__item">
          <div className="monthly-summary__label">Expenses</div>
          <div className="monthly-summary__value monthly-summary__value--expenses">
            -{formatCurrency(expenses)}
          </div>
        </div>
        
        <div className="monthly-summary__item">
          <div className="monthly-summary__label">Remaining</div>
          <div className={`monthly-summary__value ${remaining >= 0 ? 'monthly-summary__value--positive' : 'monthly-summary__value--negative'}`}>
            {remaining >= 0 ? '+' : ''}{formatCurrency(remaining)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;