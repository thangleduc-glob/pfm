/**
 * RegisterPage component
 * Renders the registration form and handles user creation
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';

/**
 * RegisterPage component for user registration
 * Displays the registration form and handles navigation after successful registration
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle successful registration
   * Redirects to login page with success message
   */
  const handleRegisterSuccess = () => {
    // Clear any existing errors
    setError(null);
    
    // Redirect to login page
    navigate('/login', { 
      state: { 
        message: 'Registration successful! Please sign in to continue.' 
      } 
    });
  };

  /**
   * Handle registration error
   * Displays error message to user
   */
  const handleRegisterError = (errorMessage: string) => {
    setError(errorMessage);
  };

  /**
   * Clear error message when component unmounts or user navigates away
   */
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">
            Join Personal Finance Manager to track your income and expenses
          </p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onError={handleRegisterError}
        />
      </div>
    </div>
  );
};

export default RegisterPage;