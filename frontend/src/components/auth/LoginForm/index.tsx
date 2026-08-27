/**
 * LoginForm component
 * Handles user authentication with form validation
 */

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { LoginRequest } from '../../../types/auth';
import AuthService from '../../../services/authService';
import Button from '../../common/Button';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormInputs {
  username: string;
  password: string;
}

/**
 * LoginForm component for user authentication
 * Provides username and password fields with validation
 */
const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormInputs>({
    mode: 'onBlur',
  });

  /**
   * Handle form submission
   * Validates input and attempts login
   */
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsLoading(true);
    
    try {
      // Client-side validation is handled by react-hook-form
      // No additional validation needed here

      // Attempt login
      await AuthService.login(data as LoginRequest);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Set form error for username field to show general error
      setError('root', { message: errorMessage });
      
      // Call error callback if provided
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters',
              },
              maxLength: {
                value: 50,
                message: 'Username cannot exceed 50 characters',
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores',
              },
            })}
            type="text"
            id="username"
            className={`form-input ${errors.username ? 'error' : ''}`}
            placeholder="Enter your username"
            disabled={isLoading}
            autoComplete="username"
            aria-describedby={errors.username ? 'username-error' : undefined}
          />
          {errors.username && (
            <div id="username-error" className="error-message" role="alert">
              {errors.username.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
            type="password"
            id="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Enter your password"
            disabled={isLoading}
            autoComplete="current-password"
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <div id="password-error" className="error-message" role="alert">
              {errors.password.message}
            </div>
          )}
        </div>

        {errors.root && (
          <div className="form-error" role="alert">
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="large"
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="form-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="link">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;