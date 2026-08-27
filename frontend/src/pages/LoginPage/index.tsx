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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect width="48" height="48" rx="12" fill="currentColor" />
                  <path d="M24 14C18.48 14 14 18.48 14 24C14 29.52 18.48 34 24 34C29.52 34 34 29.52 34 24C34 18.48 29.52 14 24 14ZM24 19C25.66 19 27 20.34 27 22C27 23.66 25.66 25 24 25C22.34 25 21 23.66 21 22C21 20.34 22.34 19 24 19ZM24 30C22.07 30 19.7 28.99 18.4 27.29C18.44 25.54 22.21 24.5 24 24.5C25.79 24.5 29.56 25.54 29.6 27.29C28.3 28.99 25.93 30 24 30Z" fill="white"/>
                </svg>
              </div>
              <h1 className="auth-title">Personal Finance Manager</h1>
            </div>
            <p className="auth-subtitle">Sign in to manage your financial future</p>
          </div>
          
          <div className="auth-body">
            {error && (
              <div className="alert alert-error" role="alert">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            <LoginForm
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
            />
          </div>
          
          <div className="auth-footer">
            <p className="auth-switch">
              Don't have an account?{' '}
              <a href="/register" className="auth-link">
                Get started
              </a>
            </p>
          </div>
        </div>
        
        <div className="auth-features">
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h3>Bank-Level Security</h3>
            <p>Your data is encrypted with industry-standard security protocols</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <h3>Smart Budgeting</h3>
            <p>Track expenses and optimize your spending automatically</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                <path d="M3 5c0 1.66 4 3 9 3s9-1.34 9-3S17 2 12 2 3 3.34 3 5z" />
              </svg>
            </div>
            <h3>Financial Insights</h3>
            <p>Get detailed analytics and reports on your financial health</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;