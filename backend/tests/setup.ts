import 'jest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mysql://root:12345678@localhost:3306/pfm_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-256-bits-long';
process.env.LOG_LEVEL = 'error';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Set up global test timeout
jest.setTimeout(10000);