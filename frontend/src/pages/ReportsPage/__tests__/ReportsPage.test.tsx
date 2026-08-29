/**
 * Unit tests for ReportsPage component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportsPage from '../index';
import { expenseReportService } from '../../../services/expenseReportService';

// Mock the expense report service
vi.mock('../../../services/expenseReportService');
const mockExpenseReportService = expenseReportService as any;

// Mock CSS modules
vi.mock('../ReportsPage.module.css', () => ({
  default: {}
}));

describe('ReportsPage Component', () => {
  const mockReport = {
    categories: [
      {
        categoryName: 'Food',
        categoryId: '1',
        totalAmount: 500,
        transactionCount: 10,
        percentage: 50
      }
    ],
    grandTotal: 500,
    totalTransactions: 10,
    generatedAt: '2024-01-15T10:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header', () => {
    mockExpenseReportService.generateExpenseReport.mockResolvedValue(mockReport);
    
    render(<ReportsPage />);
    expect(screen.getByText('Expense Reports')).toBeInTheDocument();
  });

  it('renders filter inputs', () => {
    mockExpenseReportService.generateExpenseReport.mockResolvedValue(mockReport);
    
    render(<ReportsPage />);
    
    expect(screen.getByLabelText('Start Date:')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
  });

  it('loads report on mount', async () => {
    mockExpenseReportService.generateExpenseReport.mockResolvedValue(mockReport);
    
    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(mockExpenseReportService.generateExpenseReport).toHaveBeenCalledWith({});
    });
  });

  it('handles filter changes', async () => {
    mockExpenseReportService.generateExpenseReport.mockResolvedValue(mockReport);
    
    render(<ReportsPage />);
    
    const startDateInput = screen.getByLabelText('Start Date:');
    
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    
    await waitFor(() => {
      expect(mockExpenseReportService.generateExpenseReport).toHaveBeenCalledWith({
        startDate: '2024-01-01'
      });
    });
  });

  it('clears filters', async () => {
    mockExpenseReportService.generateExpenseReport.mockResolvedValue(mockReport);
    
    render(<ReportsPage />);
    
    const startDateInput = screen.getByLabelText('Start Date:');
    const clearButton = screen.getByRole('button', { name: 'Clear Filters' });
    
    // Set a filter first
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    
    await waitFor(() => {
      expect(mockExpenseReportService.generateExpenseReport).toHaveBeenCalledWith({
        startDate: '2024-01-01'
      });
    });
    
    // Clear filters
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(mockExpenseReportService.generateExpenseReport).toHaveBeenCalledWith({});
    });
  });

  it('disables clear button when no filters are set', () => {
    mockExpenseReportService.generateExpenseReport.mockResolvedValue(mockReport);
    
    render(<ReportsPage />);
    
    const clearButton = screen.getByRole('button', { name: 'Clear Filters' });
    expect(clearButton).toBeDisabled();
  });

  it('enables clear button when filters are set', () => {
    mockExpenseReportService.generateExpenseReport.mockResolvedValue(mockReport);
    
    render(<ReportsPage />);
    
    const startDateInput = screen.getByLabelText('Start Date:');
    const clearButton = screen.getByRole('button', { name: 'Clear Filters' });
    
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    
    expect(clearButton).not.toBeDisabled();
  });

  it('handles empty date inputs', async () => {
    mockExpenseReportService.generateExpenseReport.mockResolvedValue(mockReport);
    
    render(<ReportsPage />);
    
    const startDateInput = screen.getByLabelText('Start Date:');
    
    // Set and then clear the date
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(startDateInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(mockExpenseReportService.generateExpenseReport).toHaveBeenCalledWith({});
    });
  });
});