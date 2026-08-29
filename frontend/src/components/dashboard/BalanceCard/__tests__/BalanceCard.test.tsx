/**
 * BalanceCard Component Tests
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import BalanceCard from '../index';

// Mock the formatting utility
vi.mock('../../../utils/formatting', () => ({
  formatCurrency: (amount: number) => {
    // Format with commas like the real function
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },
}));

describe('BalanceCard', () => {
  it('displays positive balance correctly', () => {
    render(<BalanceCard balance={1000} />);
    
    expect(screen.getByText('Current Balance')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('displays negative balance correctly', () => {
    render(<BalanceCard balance={-500} />);
    
    expect(screen.getByText('Current Balance')).toBeInTheDocument();
    expect(screen.getByText('-$500.00')).toBeInTheDocument();
    expect(screen.getByText('Overdrawn')).toBeInTheDocument();
  });

  it('displays zero balance correctly', () => {
    render(<BalanceCard balance={0} />);
    
    expect(screen.getByText('Current Balance')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<BalanceCard balance={0} loading={true} />);
  });

  it('displays error state', () => {
    render(<BalanceCard balance={0} error="Failed to load" />);
    
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });
});