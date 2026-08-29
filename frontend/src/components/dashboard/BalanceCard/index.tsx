/**
 * BalanceCard Component
 * Displays the current balance prominently on the dashboard
 */

import React from 'react';
import { BalanceCardProps } from '../../../types/dashboard';
import { formatCurrency } from '../../../utils/formatting';
import './BalanceCard.css';

/**
 * BalanceCard component displays the current balance
 * @param balance - Current balance amount
 * @param loading - Whether the data is loading
 * @param error - Error message if any
 */
const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  loading = false,
  error = null,
}) => {
  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className="balance-card balance-card--loading">
        <div className="balance-card__skeleton"></div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="balance-card balance-card--error">
        <div className="balance-card__error-message">
          {error}
        </div>
      </div>
    );
  }

  /**
   * Render balance
   */
  const isNegative = balance < 0;
  const balanceClass = isNegative ? 'balance-card__amount--negative' : 'balance-card__amount--positive';

  return (
    <div className="balance-card">
      <h2 className="balance-card__title">Current Balance</h2>
      <div className={`balance-card__amount ${balanceClass}`}>
        {formatCurrency(balance)}
      </div>
      <div className="balance-card__subtitle">
        {isNegative ? 'Overdrawn' : 'Available'}
      </div>
    </div>
  );
};

export default BalanceCard;