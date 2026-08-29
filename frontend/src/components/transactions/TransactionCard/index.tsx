/**
 * TransactionCard Component
 * Displays a single transaction with details and actions
 */

import React from 'react';
import { Transaction } from '../../../types/transaction';
import { formatCurrency, formatDate } from '../../../utils/formatting';
import './TransactionCard.css';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  showActions?: boolean;
}

/**
 * TransactionCard component displays transaction information
 * @param transaction - Transaction data to display
 * @param onEdit - Optional callback for edit action
 * @param onDelete - Optional callback for delete action
 * @param showActions - Whether to show action buttons (default: true)
 */
const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const isIncome = transaction.type === 'INCOME';
  const amountClass = isIncome ? 'transaction-card__amount--income' : 'transaction-card__amount--expense';
  const typeIcon = isIncome ? '↑' : '↓';

  /**
   * Handle edit button click
   */
  const handleEdit = () => {
    onEdit?.(transaction);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this ${transaction.type} of ${formatCurrency(transaction.amount)}?`)) {
      onDelete?.(transaction);
    }
  };

  return (
    <div className="transaction-card" data-testid="transaction-card">
      <div className="transaction-card__header">
        <div className="transaction-card__type">
          <span className={`transaction-card__type-icon ${amountClass}`}>
            {typeIcon}
          </span>
          <span className="transaction-card__type-text">
            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
          </span>
        </div>
        <div className={`transaction-card__amount ${amountClass}`}>
          {formatCurrency(transaction.amount)}
        </div>
      </div>

      <div className="transaction-card__details">
        <div className="transaction-card__category">
          <span className="transaction-card__label">Category:</span>
          <span className="transaction-card__category-name">
            {transaction.category.name}
          </span>
        </div>

        <div className="transaction-card__date">
          <span className="transaction-card__label">Date:</span>
          <span>{formatDate(transaction.date)}</span>
        </div>

        {transaction.note && (
          <div className="transaction-card__note">
            <span className="transaction-card__label">Note:</span>
            <span>{transaction.note}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="transaction-card__actions">
          <button
            className="transaction-card__action transaction-card__action--edit"
            onClick={handleEdit}
            data-testid="edit-transaction"
            aria-label="Edit transaction"
          >
            Edit
          </button>
          <button
            className="transaction-card__action transaction-card__action--delete"
            onClick={handleDelete}
            data-testid="delete-transaction"
            aria-label="Delete transaction"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;