/**
 * Unit tests for Sidebar component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '../index';

// Mock CSS modules
vi.mock('../Sidebar.css', () => ({
  default: {}
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true
});

describe('Sidebar Component', () => {
  beforeEach(() => {
    mockConfirm.mockClear();
    // Set up some localStorage data
    localStorage.setItem('test', 'data');
    localStorage.setItem('token', 'fake-token');
  });

  it('renders navigation menu items', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton.closest('button')).toHaveAttribute('aria-label', 'Logout');
  });

  it('shows confirmation dialog when logout is clicked', () => {
    mockConfirm.mockReturnValue(false); // User cancels logout

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to logout?');
    // localStorage should still have data since user cancelled
    expect(localStorage.getItem('test')).toBe('data');
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  it('clears localStorage and navigates to login when logout is confirmed', () => {
    mockConfirm.mockReturnValue(true); // User confirms logout

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to logout?');
    // localStorage should be cleared
    expect(localStorage.getItem('test')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('does not show text when sidebar is closed', () => {
    render(
      <MemoryRouter>
        <Sidebar isOpen={false} />
      </MemoryRouter>
    );

    // Icons should still be visible
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('📁')).toBeInTheDocument();
    expect(screen.getByText('📈')).toBeInTheDocument();
    expect(screen.getByText('🚪')).toBeInTheDocument();
    
    // But text labels should not be visible
    expect(screen.queryByText('Dashboard')).toBeNull();
    expect(screen.queryByText('Transactions')).toBeNull();
    expect(screen.queryByText('Categories')).toBeNull();
    expect(screen.queryByText('Reports')).toBeNull();
    expect(screen.queryByText('Logout')).toBeNull();
  });
});