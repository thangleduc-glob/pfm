/**
 * RegisterForm component
 * Handles user registration with form validation
 */

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { RegisterRequest } from '../../../types/auth';
import AuthService from '../../../services/authService';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
      // Always show "Registration failed" for any registration error
      const errorMessage = 'Registration failed';
      
      // Set form error to show the error message
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
          <div className="password-input-wrapper">
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
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a password"
              disabled={isLoading}
              autoComplete="new-password"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <div id="password-error" className="form-error" role="alert">
              {errors.password.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <div className="password-input-wrapper">
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              disabled={isLoading}
              autoComplete="new-password"
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <div id="confirmPassword-error" className="form-error" role="alert">
              {errors.confirmPassword.message}
            </div>
          )}
        </div>

        {errors.root && (
          <div className="form-error" role="alert">
            {errors.root.message}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
      <div className="form-footer">
        <span>Already have an account? </span>
        <a href="/login" className="link">
          Sign in
        </a>
      </div>
    </div>
  );
};

export default RegisterForm;