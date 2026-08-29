/**
 * MonthlySummary Component Tests
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import MonthlySummary from '../index';

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

describe('MonthlySummary', () => {
  it('displays monthly summary correctly', () => {
    render(
      <MonthlySummary
        income={3000}
        expenses={2000}
        remaining={1000}
      />
    );
    
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('+$3,000.00')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('-$2,000.00')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('+$1,000.00')).toBeInTheDocument();
  });

  it('displays negative remaining amount correctly', () => {
    render(
      <MonthlySummary
        income={2000}
        expenses={3000}
        remaining={-1000}
      />
    );
    
    expect(screen.getByText('-$1,000.00')).toBeInTheDocument();
  });

  it('displays zero values correctly', () => {
    render(
      <MonthlySummary
        income={0}
        expenses={0}
        remaining={0}
      />
    );
    
    expect(screen.getByText('+$0.00')).toBeInTheDocument();
    expect(screen.getByText('-$0.00')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(
      <MonthlySummary
        income={0}
        expenses={0}
        remaining={0}
        loading={true}
      />
    );
    
    expect(screen.container.querySelector('.monthly-summary--loading')).toBeInTheDocument();
    expect(screen.container.querySelector('.monthly-summary__skeleton')).toBeInTheDocument();
  });

  it('displays error state', () => {
    render(
      <MonthlySummary
        income={0}
        expenses={0}
        remaining={0}
        error="Failed to load"
      />
    );
    
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });
});