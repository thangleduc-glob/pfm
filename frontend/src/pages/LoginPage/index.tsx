/**
 * LoginPage component
 * Renders the login form and handles authentication
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

/**
 * LoginPage component for user authentication
 * Displays the login form and handles navigation after successful login
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle successful login
   * Redirects to dashboard
   */
  const handleLoginSuccess = () => {
    // Clear any existing errors
    setError(null);
    
    // Redirect to dashboard
    navigate('/dashboard');
  };

  /**
   * Handle login error
   * Displays error message to user
   */
  const handleLoginError = (errorMessage: string) => {
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
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to your Personal Finance Manager account
          </p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <LoginForm
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
        />
      </div>
    </div>
  );
};

export default LoginPage;