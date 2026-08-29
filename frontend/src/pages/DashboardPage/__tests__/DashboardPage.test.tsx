/**
 * DashboardPage Component Tests
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardPage from '../index';

// Mock the DashboardSummary component
vi.mock('../../components/dashboard/DashboardSummary', () => {
  return function MockDashboardSummary() {
    return <div data-testid="dashboard-summary">Dashboard Summary</div>;
  };
});

describe('DashboardPage', () => {
  it('renders the dashboard page', () => {
    render(<DashboardPage />);
    
    expect(screen.getByTestId('dashboard-summary')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Summary')).toBeInTheDocument();
  });

  it('has correct page structure', () => {
    const { container } = render(<DashboardPage />);
    
    expect(container.firstChild).toHaveClass('dashboard-page');
  });
});