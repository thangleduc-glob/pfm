/**
 * Application constants for the backend
 * Includes error codes, status messages, and configuration values
 */

/** Error codes for API responses */
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Business logic errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  CATEGORY_HAS_TRANSACTIONS: 'CATEGORY_HAS_TRANSACTIONS',
  CATEGORY_TYPE_MISMATCH: 'CATEGORY_TYPE_MISMATCH',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;

/** HTTP status codes */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;

/** Transaction types */
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
} as const;

/** Category types */
export const CATEGORY_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
} as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;

/** JWT configuration */
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
} as const;

/** Password configuration */
export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  SALT_ROUNDS: 12,
  REQUIRE_LETTER: true,
  REQUIRE_NUMBER: true
} as const;

/** Username configuration */
export const USERNAME_CONFIG = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
  PATTERN: /^[a-zA-Z0-9_]+$/
} as const;

/** Category configuration */
export const CATEGORY_CONFIG = {
  NAME_MAX_LENGTH: 50
} as const;

/** Transaction configuration */
export const TRANSACTION_CONFIG = {
  NOTE_MAX_LENGTH: 255,
  MAX_AMOUNT: 999999999.99,
  DECIMAL_PLACES: 2
} as const;

/** Date formats */
export const DATE_FORMATS = {
  API: 'YYYY-MM-DD',
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  MONTH: 'YYYY-MM',
  MONTH_DISPLAY: 'MMMM YYYY'
} as const;

/** Rate limiting configuration */
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // limit each IP to 100 requests per windowMs
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_AUTH_ATTEMPTS: 5 // limit each IP to 5 auth attempts per windowMs
} as const;

/** Cookie configuration */
export const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: 'access_token',
  REFRESH_TOKEN_NAME: 'refresh_token',
  OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/'
  }
} as const;

/** CORS configuration */
export const CORS_CONFIG = {
  ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  CREDENTIALS: true
} as const;

/** Database configuration */
export const DATABASE_CONFIG = {
  CONNECTION_TIMEOUT: 10000,
  QUERY_TIMEOUT: 30000,
  MAX_CONNECTIONS: 10
} as const;

/** Logging configuration */
export const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FORMAT: 'json',
  DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss'
} as const;

/** Cache configuration (for future use) */
export const CACHE_CONFIG = {
  TTL: 300, // 5 minutes
  MAX_SIZE: 1000
} as const;

/** File upload configuration (for future use) */
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
} as const;

/** API version */
export const API_VERSION = 'v1';

/** API base path */
export const API_BASE_PATH = `/api/${API_VERSION}`;

/** Default currency */
export const DEFAULT_CURRENCY = 'USD';

/** Default locale */
export const DEFAULT_LOCALE = 'en-US';

/** Business days (for future use) */
export const BUSINESS_DAYS = [1, 2, 3, 4, 5] as const; // Monday-Friday

/** Month names */
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

/** Common error messages */
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid username or password',
  TOKEN_EXPIRED: 'Authentication token has expired',
  TOKEN_INVALID: 'Invalid authentication token',
  ACCESS_DENIED: 'Access denied',
  
  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  TOO_LONG: 'This field is too long',
  TOO_SHORT: 'This field is too short',
  
  // Resources
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  CANNOT_DELETE: 'Cannot delete this resource',
  
  // Business logic
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  CATEGORY_IN_USE: 'Cannot delete category with existing transactions',
  TYPE_MISMATCH: 'Category type must match transaction type',
  
  // Server
  INTERNAL_ERROR: 'An unexpected error occurred',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
} as const;

/** Success messages */
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGGED_IN: 'Logged in successfully',
  LOGGED_OUT: 'Logged out successfully'
} as const;