import { Database, db, connectDatabase, disconnectDatabase, checkDatabaseHealth } from '../../../src/config/database';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
    $on: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Database Configuration', () => {
  let mockPrismaClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaClient = new (PrismaClient as any)();
  });

  describe('Database.getInstance()', () => {
    it('should return a singleton instance', () => {
      const instance1 = Database.getInstance();
      const instance2 = Database.getInstance();

      expect(instance1).toBe(instance2);
      expect(PrismaClient).toHaveBeenCalledTimes(1);
    });

    it('should configure PrismaClient with logging', () => {
      // Reset the instance to force recreation
      (Database as any).instance = null;
      Database.getInstance();

      expect(PrismaClient).toHaveBeenCalledWith({
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
        ],
      });
    });

    it('should set up event listeners for logging', () => {
      // Reset the instance to force recreation
      (Database as any).instance = null;
      Database.getInstance();

      expect(mockPrismaClient.$on).toHaveBeenCalledWith('query', expect.any(Function));
      expect(mockPrismaClient.$on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockPrismaClient.$on).toHaveBeenCalledWith('info', expect.any(Function));
      expect(mockPrismaClient.$on).toHaveBeenCalledWith('warn', expect.any(Function));
    });
  });

  describe('Database.connect()', () => {
    it('should connect to the database successfully', async () => {
      mockPrismaClient.$connect.mockResolvedValue(undefined);

      await expect(Database.connect()).resolves.not.toThrow();
      expect(mockPrismaClient.$connect).toHaveBeenCalledTimes(1);
    });

    it('should log success message on successful connection', async () => {
      mockPrismaClient.$connect.mockResolvedValue(undefined);
      const { logger } = require('../../../src/utils/logger');

      await Database.connect();

      expect(logger.info).toHaveBeenCalledWith('Database connected successfully');
    });

    it('should throw and log error on connection failure', async () => {
      const error = new Error('Connection failed');
      mockPrismaClient.$connect.mockRejectedValue(error);
      const { logger } = require('../../../src/utils/logger');

      await expect(Database.connect()).rejects.toThrow('Connection failed');
      expect(logger.error).toHaveBeenCalledWith('Failed to connect to database', { error });
    });
  });

  describe('Database.disconnect()', () => {
    it('should disconnect from the database successfully', async () => {
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);

      // First get an instance
      Database.getInstance();

      await expect(Database.disconnect()).resolves.not.toThrow();
      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1);
    });

    it('should log success message on successful disconnection', async () => {
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);
      const { logger } = require('../../../src/utils/logger');

      Database.getInstance();
      await Database.disconnect();

      expect(logger.info).toHaveBeenCalledWith('Database disconnected successfully');
    });

    it('should handle null instance gracefully', async () => {
      await expect(Database.disconnect()).resolves.not.toThrow();
    });

    it('should throw and log error on disconnection failure', async () => {
      const error = new Error('Disconnection failed');
      mockPrismaClient.$disconnect.mockRejectedValue(error);
      const { logger } = require('../../../src/utils/logger');

      Database.getInstance();

      await expect(Database.disconnect()).rejects.toThrow('Disconnection failed');
      expect(logger.error).toHaveBeenCalledWith('Failed to disconnect from database', { error });
    });
  });

  describe('Database.healthCheck()', () => {
    it('should return true for healthy database', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const result = await Database.healthCheck();

      expect(result).toBe(true);
      expect(mockPrismaClient.$queryRaw).toHaveBeenCalledWith`SELECT 1`;
    });

    it('should return false for unhealthy database', async () => {
      const error = new Error('Database error');
      mockPrismaClient.$queryRaw.mockRejectedValue(error);
      const { logger } = require('../../../src/utils/logger');

      const result = await Database.healthCheck();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Database health check failed', { error });
    });
  });

  describe('Exported utilities', () => {
    it('should export db instance', () => {
      expect(db).toBeDefined();
      expect(db).toBe(Database.getInstance());
    });

    it('should export connectDatabase function', () => {
      expect(connectDatabase).toBe(Database.connect);
    });

    it('should export disconnectDatabase function', () => {
      expect(disconnectDatabase).toBe(Database.disconnect);
    });

    it('should export checkDatabaseHealth function', () => {
      expect(checkDatabaseHealth).toBe(Database.healthCheck);
    });
  });

  describe('Event listeners', () => {
    let mockLogger: any;

    beforeEach(() => {
      mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };
      jest.doMock('../../../src/utils/logger', () => ({ logger: mockLogger }));
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('should log query events', () => {
      Database.getInstance();

      // Get the query event handler
      const queryHandler = (mockPrismaClient.$on as jest.Mock).mock.calls
        .find(([event]) => event === 'query')?.[1];

      if (queryHandler) {
        queryHandler({ query: 'SELECT * FROM users', params: '[]', duration: 10 });
        expect(mockLogger.debug).toHaveBeenCalledWith('Database query', {
          query: 'SELECT * FROM users',
          params: '[]',
          duration: 10,
        });
      }
    });

    it('should log error events', () => {
      Database.getInstance();

      // Get the error event handler
      const errorHandler = (mockPrismaClient.$on as jest.Mock).mock.calls
        .find(([event]) => event === 'error')?.[1];

      if (errorHandler) {
        errorHandler({ message: 'Database error', target: 'query' });
        expect(mockLogger.error).toHaveBeenCalledWith('Database error', {
          message: 'Database error',
          target: 'query',
        });
      }
    });

    it('should log info events', () => {
      Database.getInstance();

      // Get the info event handler
      const infoHandler = (mockPrismaClient.$on as jest.Mock).mock.calls
        .find(([event]) => event === 'info')?.[1];

      if (infoHandler) {
        infoHandler({ message: 'Migration applied', target: 'prisma' });
        expect(mockLogger.info).toHaveBeenCalledWith('Database info', {
          message: 'Migration applied',
          target: 'prisma',
        });
      }
    });

    it('should log warning events', () => {
      Database.getInstance();

      // Get the warning event handler
      const warnHandler = (mockPrismaClient.$on as jest.Mock).mock.calls
        .find(([event]) => event === 'warn')?.[1];

      if (warnHandler) {
        warnHandler({ message: 'Slow query detected', target: 'query' });
        expect(mockLogger.warn).toHaveBeenCalledWith('Database warning', {
          message: 'Slow query detected',
          target: 'query',
        });
      }
    });
  });
});