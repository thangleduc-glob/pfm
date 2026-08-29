/**
 * Unit tests for CategoryChart component
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryChart from '../index';
import { ExpenseReport as ExpenseReportType } from '../../../../services/expenseReportService';

// Mock CSS modules
vi.mock('../CategoryChart.module.css', () => ({
  default: {}
}));

describe('CategoryChart Component', () => {
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
      }
    ],
    grandTotal: 800,
    totalTransactions: 15,
    generatedAt: '2024-01-15T10:00:00Z'
  };

  it('displays loading state', () => {
    render(<CategoryChart report={null} loading={true} />);
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<CategoryChart report={null} loading={false} error="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('displays empty state when no report data', () => {
    render(<CategoryChart report={null} loading={false} error={null} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('displays chart title', () => {
    render(<CategoryChart report={mockReport} loading={false} error={null} />);
    expect(screen.getByText('Expense by Category')).toBeInTheDocument();
  });

  it('displays category names', () => {
    render(<CategoryChart report={mockReport} loading={false} error={null} />);
    
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('displays category amounts', () => {
    render(<CategoryChart report={mockReport} loading={false} error={null} />);
    
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('$300.00')).toBeInTheDocument();
  });

  it('displays category percentages', () => {
    render(<CategoryChart report={mockReport} loading={false} error={null} />);
    
    expect(screen.getByText('50.0%')).toBeInTheDocument();
    expect(screen.getByText('30.0%')).toBeInTheDocument();
  });

  it('displays total amount in legend', () => {
    render(<CategoryChart report={mockReport} loading={false} error={null} />);
    
    expect(screen.getByText('Total: $800.00')).toBeInTheDocument();
  });

  it('displays legend items', () => {
    render(<CategoryChart report={mockReport} loading={false} error={null} />);
    
    expect(screen.getByText('Expense Amount')).toBeInTheDocument();
  });

  it('handles empty categories array', () => {
    const emptyReport: ExpenseReportType = {
      categories: [],
      grandTotal: 0,
      totalTransactions: 0,
      generatedAt: '2024-01-15T10:00:00Z'
    };
    
    render(<CategoryChart report={emptyReport} loading={false} error={null} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });
});