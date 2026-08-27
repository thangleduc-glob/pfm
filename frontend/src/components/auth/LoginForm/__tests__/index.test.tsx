/**
 * Unit tests for LoginForm component
 * Tests form validation, submission, and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../index';
import AuthService from '../../../../services/authService';

// Mock AuthService
vi.mock('../../../../services/authService');
const mockedAuthService = vi.mocked(AuthService);

// Mock Button component
vi.mock('../../../../components/common/Button', () => ({
  default: ({ children, onClick, disabled, isLoading, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      data-testid="button"
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  ),
}));

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('LoginForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = (props = {}) => {
    return render(
      <TestWrapper>
        <LoginForm
          onSuccess={mockOnSuccess}
          onError={mockOnError}
          {...props}
        />
      </TestWrapper>
    );
  };

  describe('Form rendering', () => {
    it('should render all form fields', () => {
      // Act
      renderLoginForm();

      // Assert
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      // expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      // expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });

    it('should have correct input attributes', () => {
      // Act
      renderLoginForm();

      // Assert
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('autocomplete', 'username');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  describe('Form validation', () => {
    it('should show validation errors for empty fields', async () => {
      // Arrange
      const user = userEvent.setup();
      renderLoginForm();

      // Act
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short username', async () => {
      // Arrange
      const user = userEvent.setup();
      renderLoginForm();

      // Act
      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'ab');
      await user.tab(); // Trigger blur

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for long username', async () => {
      // Arrange
      const user = userEvent.setup();
      renderLoginForm();

      // Act
      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'a'.repeat(51));
      await user.tab(); // Trigger blur

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/username cannot exceed 50 characters/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid username characters', async () => {
      // Arrange
      const user = userEvent.setup();
      renderLoginForm();

      // Act
      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'user@name');
      await user.tab(); // Trigger blur

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/username can only contain letters, numbers, and underscores/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short password', async () => {
      // Arrange
      const user = userEvent.setup();
      renderLoginForm();

      // Act
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      await user.type(passwordInput, '123');
      await user.tab(); // Trigger blur

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    it('should call AuthService.login with correct data', async () => {
      // Arrange
      const user = userEvent.setup();
      mockedAuthService.login.mockResolvedValue({
        user: {
          id: '123',
          username: 'testuser',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      renderLoginForm();

      // Act
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockedAuthService.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
      });
    });

    it('should call onSuccess callback when login succeeds', async () => {
      // Arrange
      const user = userEvent.setup();
      mockedAuthService.login.mockResolvedValue({
        user: {
          id: '123',
          username: 'testuser',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      renderLoginForm();

      // Act
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should show error message when login fails', async () => {
      // Arrange
      const user = userEvent.setup();
      mockedAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      renderLoginForm();

      // Act
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        expect(mockOnError).toHaveBeenCalledWith('Invalid credentials');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Act
      renderLoginForm();

      // Assert
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      // aria-describedby is only present when there are errors
      expect(usernameInput).not.toHaveAttribute('aria-describedby');
      expect(passwordInput).not.toHaveAttribute('aria-describedby');
    });

    it('should associate error messages with inputs', async () => {
      // Arrange
      const user = userEvent.setup();
      renderLoginForm();

      // Act
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        const usernameError = screen.getByText(/username is required/i);
        const passwordError = screen.getByText(/password is required/i);

        expect(usernameError).toHaveAttribute('role', 'alert');
        expect(passwordError).toHaveAttribute('role', 'alert');
      });
    });
  });
});