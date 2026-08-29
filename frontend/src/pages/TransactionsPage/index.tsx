/**
 * TransactionsPage Component
 * Main page for managing transactions
 */

import React from 'react';
import { Transaction } from '../../types/transaction';
import TransactionList from '../../components/transactions/TransactionList';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import './TransactionsPage.css';

/**
 * TransactionsPage component - Main transaction management page
 * Combines all transaction-related components into a complete user interface
 */
const TransactionsPage: React.FC = () => {
  /**
   * Handle transaction edit
   * @param transaction - The transaction being edited
   */
  const handleEditTransaction = (transaction: Transaction) => {
    console.log('Editing transaction:', transaction);
    // In a real implementation, this might open a modal or navigate to edit page
  };

  /**
   * Handle transaction delete
   * @param transaction - The transaction being deleted
   */
  const handleDeleteTransaction = (transaction: Transaction) => {
    console.log('Deleted transaction:', transaction);
    // In a real implementation, this might show a success notification
  };

  /**
   * Handle transaction creation
   */
  const handleCreateTransaction = () => {
    console.log('Created new transaction');
    // In a real implementation, this might show a success notification
  };

  return (
    <ProtectedRoute>
      <div className="transactions-page" data-testid="transactions-page">
        <div className="transactions-page__container">
          <header className="transactions-page__header">
            <h1 className="transactions-page__title">Transaction Management</h1>
            <p className="transactions-page__subtitle">
              Manage your income and expense transactions
            </p>
          </header>

          <main className="transactions-page__main">
            <TransactionList
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onCreateTransaction={handleCreateTransaction}
            />
          </main>

          <footer className="transactions-page__footer">
            <p className="transactions-page__footer-text">
              Tip: Use filters to quickly find specific transactions or view transactions by category.
            </p>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TransactionsPage;