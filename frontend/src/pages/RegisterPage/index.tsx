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
              <h1 className="auth-title">Create Your Account</h1>
            </div>
            <p className="auth-subtitle">Start your journey to financial wellness today</p>
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
            
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onError={handleRegisterError}
            />
          </div>
          
          <div className="auth-footer">
            <p className="auth-switch">
              Already have an account?{' '}
              <a href="/login" className="auth-link">
                Sign in
              </a>
            </p>
          </div>
        </div>
        
        <div className="auth-features">
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </div>
            <h3>Free Forever</h3>
            <p>No hidden fees or premium tiers - all features available for free</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <h3>Privacy First</h3>
            <p>Your financial data stays private and is never shared with third parties</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3>Easy Setup</h3>
            <p>Get started in minutes with our intuitive onboarding process</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;