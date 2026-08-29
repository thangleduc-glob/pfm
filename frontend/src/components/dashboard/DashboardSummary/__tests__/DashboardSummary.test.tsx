/**
 * DashboardSummary Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import DashboardSummary from '../index';

// Mock the dashboard service
vi.mock('../../../services/dashboardService', () => ({
  __esModule: true,
  default: {
    getDashboardData: vi.fn(),
  },
}));

// Mock the child components
vi.mock('../BalanceCard', () => {
  return function MockBalanceCard({ balance, loading, error }: any) {
    return (
      <div data-testid="balance-card">
        Balance: {balance}, Loading: {loading ? 'true' : 'false'}, Error: {error || 'null'}
      </div>
    );
  };
});

vi.mock('../MonthlySummary', () => {
  return function MockMonthlySummary({ income, expenses, remaining, loading, error }: any) {
    return (
      <div data-testid="monthly-summary">
        Income: {income}, Expenses: {expenses}, Remaining: {remaining}, Loading: {loading ? 'true' : 'false'}, Error: {error || 'null'}
      </div>
    );
  };
});

import DashboardService from '../../../services/dashboardService';

describe('DashboardSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with provided data', () => {
    const mockData = {
      currentBalance: 5000,
      currentMonthIncome: 3000,
      currentMonthExpenses: 2000,
      remainingAmount: 1000,
    };

    render(<DashboardSummary data={mockData} />);
    
    expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('balance-card')).toHaveTextContent('Balance: 5000');
    expect(screen.getByTestId('monthly-summary')).toHaveTextContent('Income: 3000');
    expect(screen.getByTestId('monthly-summary')).toHaveTextContent('Expenses: 2000');
    expect(screen.getByTestId('monthly-summary')).toHaveTextContent('Remaining: 1000');
  });

  it('renders loading state', () => {
    render(<DashboardSummary loading={true} />);
    
    expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('balance-card')).toHaveTextContent('Loading: true');
    expect(screen.getByTestId('monthly-summary')).toHaveTextContent('Loading: true');
  });

  it('renders error state', () => {
    render(<DashboardSummary error="Failed to load" />);
    
    expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('balance-card')).toHaveTextContent('Error: Failed to load');
    expect(screen.getByTestId('monthly-summary')).toHaveTextContent('Error: Failed to load');
  });

  it('has refresh button', () => {
    render(<DashboardSummary />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', async () => {
    const mockOnRefresh = jest.fn();
    render(<DashboardSummary onRefresh={mockOnRefresh} />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await userEvent.click(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalled();
  });
});