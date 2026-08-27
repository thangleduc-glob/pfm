/**
 * Authentication-related type definitions for the frontend
 * These types define the shape of authentication data and API responses
 */

/** User information returned from the API */
export interface User {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

/** Login request payload */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Registration request payload */
export interface RegisterRequest {
  username: string;
  password: string;
}

/** Authentication response containing user data */
export interface AuthResponse {
  user: User;
}

/** Authentication context state */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/** Authentication context actions */
export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/** Combined authentication context interface */
export type AuthContext = AuthState & AuthActions;

/** API error response format */
export interface ApiError {
  error: string;
  code: string;
  timestamp: string;
  path?: string;
  method?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}