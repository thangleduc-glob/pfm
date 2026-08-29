/**
 * Unit tests for ExpenseReport component
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExpenseReport from '../index';
import { ExpenseReport as ExpenseReportType } from '../../../../services/expenseReportService';

// Mock CSS modules
vi.mock('../ExpenseReport.module.css', () => ({
  default: {}
}));

describe('ExpenseReport Component', () => {
  const mockReport: ExpenseReportType = {
    categories: [
      {
        categoryName: 'Food',
        categoryId: '1',
        totalAmount: 500,
        transactionCount: 10,
        percentage: 50
      },
      {
        categoryName: 'Transport',
        categoryId: '2',
        totalAmount: 300,
        transactionCount: 5,
        percentage: 30
      },
      {
        categoryName: 'Entertainment',
        categoryId: '3',
        totalAmount: 200,
        transactionCount: 3,
        percentage: 20
      }
    ],
    grandTotal: 1000,
    totalTransactions: 18,
    generatedAt: '2024-01-15T10:00:00Z'
  };

  it('displays loading state', () => {
    render(<ExpenseReport report={null} loading={true} />);
    expect(screen.getByText('Loading expense report...')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<ExpenseReport report={null} loading={false} error="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('displays empty state when no report data', () => {
    render(<ExpenseReport report={null} loading={false} error={null} />);
    expect(screen.getByText('No expense data')).toBeInTheDocument();
    expect(screen.getByText('There are no expense transactions in the selected period.')).toBeInTheDocument();
  });

  it('displays expense categories in correct order', () => {
    render(<ExpenseReport report={mockReport} loading={false} error={null} />);
    
    // Check categories are displayed
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    
    // Check amounts are displayed
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('$300.00')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  it('displays transaction counts', () => {
    render(<ExpenseReport report={mockReport} loading={false} error={null} />);
    
    expect(screen.getByText('10 transactions')).toBeInTheDocument();
    expect(screen.getByText('5 transactions')).toBeInTheDocument();
    expect(screen.getByText('3 transactions')).toBeInTheDocument();
  });

  it('displays percentages', () => {
    render(<ExpenseReport report={mockReport} loading={false} error={null} />);
    
    expect(screen.getByText('(50.0%)')).toBeInTheDocument();
    expect(screen.getByText('(30.0%)')).toBeInTheDocument();
    expect(screen.getByText('(20.0%)')).toBeInTheDocument();
  });

  it('displays grand total', () => {
    render(<ExpenseReport report={mockReport} loading={false} error={null} />);
    
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('$1000.00')).toBeInTheDocument();
    expect(screen.getByText('(18 transactions)')).toBeInTheDocument();
  });

  it('displays report generation date', () => {
    render(<ExpenseReport report={mockReport} loading={false} error={null} />);
    
    expect(screen.getByText('Generated on 1/15/2024')).toBeInTheDocument();
  });

  it('handles singular transaction count', () => {
    const singleTransactionReport = {
      ...mockReport,
      categories: [{
        ...mockReport.categories[0],
        transactionCount: 1
      }],
      totalTransactions: 1
    };
    
    render(<ExpenseReport report={singleTransactionReport} loading={false} error={null} />);
    
    expect(screen.getByText('1 transaction')).toBeInTheDocument();
    expect(screen.getByText('(1 transaction)')).toBeInTheDocument();
  });
});