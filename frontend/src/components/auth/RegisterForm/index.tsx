/**
 * RegisterForm component
 * Handles user registration with form validation
 */

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { RegisterRequest } from '../../../types/auth';
import AuthService from '../../../services/authService';
import Button from '../../common/Button';

interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormInputs {
  username: string;
  password: string;
  confirmPassword: string;
}

/**
 * RegisterForm component for user registration
 * Provides username, password, and confirm password fields with validation
 */
const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<FormInputs>({
    mode: 'onBlur',
  });

  // Watch password field for confirm password validation
  const password = watch('password');

  /**
   * Handle form submission
   * Validates input and attempts registration
   */
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsLoading(true);
    
    try {
      // Client-side validation is handled by react-hook-form
      // No additional validation needed here

      // Additional validation for password confirmation
      if (data.password !== data.confirmPassword) {
        setError('confirmPassword', {
          message: 'Passwords do not match',
        });
        return;
      }

      // Attempt registration
      const registerData: RegisterRequest = {
        username: data.username,
        password: data.password,
      };
      
      await AuthService.register(registerData);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
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
    <div className="register-form">
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
            placeholder="Choose a username"
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
              pattern: {
                value: /^(?=.*[a-zA-Z])(?=.*\d)/,
                message: 'Password must contain at least one letter and one number',
              },
            })}
            type="password"
            id="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Create a password"
            disabled={isLoading}
            autoComplete="new-password"
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <div id="password-error" className="error-message" role="alert">
              {errors.password.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
            type="password"
            id="confirmPassword"
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Confirm your password"
            disabled={isLoading}
            autoComplete="new-password"
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          />
          {errors.confirmPassword && (
            <div id="confirmPassword-error" className="error-message" role="alert">
              {errors.confirmPassword.message}
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
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="form-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;