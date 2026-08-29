/**
 * TransactionList Component
 * Displays a list of transactions with filtering, pagination, and actions
 */

import React, { useState, useEffect } from "react";
import {
  Transaction,
  TransactionFilters,
} from "../../../types/transaction";
import TransactionCard from "../TransactionCard";
import TransactionForm from "../TransactionForm";
import TransactionFilter from "../TransactionFilter";
import TransactionService from "../../../services/transactionService";
import PageHeader from "../../common/PageHeader";
import "./TransactionList.css";

interface TransactionListProps {
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transaction: Transaction) => void;
  onCreateTransaction?: () => void;
}

/**
 * TransactionList component displays and manages transactions
 * @param onEditTransaction - Optional callback for edit action
 * @param onDeleteTransaction - Optional callback for delete action
 * @param onCreateTransaction - Optional callback for create action
 */
const TransactionList: React.FC<TransactionListProps> = ({
  onEditTransaction,
  onDeleteTransaction,
  onCreateTransaction,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "all",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load transactions on component mount and when filters/pagination change
  useEffect(() => {
    loadTransactions();
  }, [filters, pagination.page]);

  /**
   * Load transactions from the API
   */
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await TransactionService.getTransactions(
        pagination.page,
        pagination.limit,
        filters,
      );

      setTransactions(response.transactions);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        totalPages: Math.ceil(response.total / response.limit),
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle transaction creation
   */
  const handleCreateTransaction = async (data: any) => {
    try {
      setSubmitting(true);
      await TransactionService.createTransaction(data);
      await loadTransactions();
      setShowForm(false);
      onCreateTransaction?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create transaction",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle transaction update
   */
  const handleUpdateTransaction = async (data: any) => {
    if (!editingTransaction) return;

    try {
      setSubmitting(true);
      await TransactionService.updateTransaction(editingTransaction.id, data);
      await loadTransactions();
      setEditingTransaction(null);
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update transaction",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle transaction edit
   */
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
    onEditTransaction?.(transaction);
  };

  /**
   * Handle transaction delete
   */
  const handleDelete = async (transaction: Transaction) => {
    try {
      setSubmitting(true);
      await TransactionService.deleteTransaction(transaction.id);
      await loadTransactions();
      onDeleteTransaction?.(transaction);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete transaction",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle form cancel
   */
  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = (data: any) => {
    if (editingTransaction) {
      handleUpdateTransaction(data);
    } else {
      handleCreateTransaction(data);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  /**
   * Calculate pagination info
   */
  const getPaginationInfo = () => {
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(start + pagination.limit - 1, pagination.total);
    return { start, end };
  };

  const paginationInfo = getPaginationInfo();

  if (loading && transactions.length === 0) {
    return (
      <div className="transaction-list" data-testid="transaction-list">
        <div className="transaction-list__loading" data-testid="loading-state">
          <div className="transaction-list__spinner"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list" data-testid="transaction-list">
      <PageHeader
        title="Transactions"
        actionLabel="Add Transaction"
        onAction={() => {
          setEditingTransaction(null);
          setShowForm(true);
        }}
        actionClassName="transaction-list__add-button"
        titleClassName="transaction-list__title"
      />

      {error && (
        <div className="transaction-list__error" data-testid="error-message">
          <span className="transaction-list__error-icon">⚠</span>
          {error}
          <button
            className="transaction-list__error-close"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <TransactionFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={loading}
      />

      {showForm && (
        <TransactionForm
          transaction={editingTransaction || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={submitting}
        />
      )}

      <div className="transaction-list__content">
        {transactions.length === 0 ? (
          <div className="transaction-list__empty" data-testid="empty-state">
            <p>
              {Object.keys(filters).some(
                (key) =>
                  filters[key as keyof TransactionFilters] !== undefined &&
                  filters[key as keyof TransactionFilters] !== "all",
              )
                ? "No transactions found matching your filters."
                : "No transactions found. Add your first transaction to get started!"}
            </p>
          </div>
        ) : (
          <>
            <div className="transaction-list__summary">
              <span className="transaction-list__summary-text">
                Showing {paginationInfo.start} to {paginationInfo.end} of{" "}
                {pagination.total} transactions
              </span>
            </div>

            <div className="transaction-list__items">
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="transaction-list__pagination">
                <button
                  className="transaction-list__pagination-button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  data-testid="prev-page"
                >
                  Previous
                </button>

                <div className="transaction-list__pagination-info">
                  Page {pagination.page} of {pagination.totalPages}
                </div>

                <button
                  className="transaction-list__pagination-button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={
                    pagination.page === pagination.totalPages || loading
                  }
                  data-testid="next-page"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
