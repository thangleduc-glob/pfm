/**
 * Unit tests for RegisterForm component
 * Tests form validation, submission, and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from '../index';
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

describe('RegisterForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegisterForm = (props = {}) => {
    return render(
      <TestWrapper>
        <RegisterForm
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
      renderRegisterForm();

      // Assert
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });

    it('should have correct input attributes', () => {
      // Act
      renderRegisterForm();

      // Assert
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('autocomplete', 'username');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
    });
  });

  describe('Form validation', () => {
    it('should show validation errors for empty fields', async () => {
      // Arrange
      const user = userEvent.setup();
      renderRegisterForm();

      // Act
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short username', async () => {
      // Arrange
      const user = userEvent.setup();
      renderRegisterForm();

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
      renderRegisterForm();

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
      renderRegisterForm();

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
      renderRegisterForm();

      // Act
      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, '123');
      await user.tab(); // Trigger blur

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for password without letter', async () => {
      // Arrange
      const user = userEvent.setup();
      renderRegisterForm();

      // Act
      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, '12345678');
      await user.tab(); // Trigger blur

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one letter and one number/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for password without number', async () => {
      // Arrange
      const user = userEvent.setup();
      renderRegisterForm();

      // Act
      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'password');
      await user.tab(); // Trigger blur

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one letter and one number/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when passwords do not match', async () => {
      // Arrange
      const user = userEvent.setup();
      renderRegisterForm();

      // Act
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password456');
      await user.tab(); // Trigger blur

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    it('should call AuthService.register with correct data', async () => {
      // Arrange
      const user = userEvent.setup();
      mockedAuthService.register.mockResolvedValue({
        user: {
          id: '123',
          username: 'testuser',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      renderRegisterForm();

      // Act
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockedAuthService.register).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
      });
    });

    it('should call onSuccess callback when registration succeeds', async () => {
      // Arrange
      const user = userEvent.setup();
      mockedAuthService.register.mockResolvedValue({
        user: {
          id: '123',
          username: 'testuser',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });

      renderRegisterForm();

      // Act
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should show error message when registration fails', async () => {
      // Arrange
      const user = userEvent.setup();
      mockedAuthService.register.mockRejectedValue(new Error('Username already exists'));

      renderRegisterForm();

      // Act
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(usernameInput, 'existinguser');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
        expect(mockOnError).toHaveBeenCalledWith('Username already exists');
      });
    });

    it('should disable form while loading', async () => {
      // Arrange
      const user = userEvent.setup();
      mockedAuthService.register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderRegisterForm();

      // Act
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      // Assert
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Act
      renderRegisterForm();

      // Assert
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      expect(usernameInput).toHaveAttribute('aria-describedby');
      expect(passwordInput).toHaveAttribute('aria-describedby');
      expect(confirmPasswordInput).toHaveAttribute('aria-describedby');
    });

    it('should associate error messages with inputs', async () => {
      // Arrange
      const user = userEvent.setup();
      renderRegisterForm();

      // Act
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        const usernameError = screen.getByText(/username is required/i);
        const passwordError = screen.getByText(/password is required/i);
        const confirmPasswordError = screen.getByText(/please confirm your password/i);

        expect(usernameError).toHaveAttribute('role', 'alert');
        expect(passwordError).toHaveAttribute('role', 'alert');
        expect(confirmPasswordError).toHaveAttribute('role', 'alert');
      });
    });
  });
});