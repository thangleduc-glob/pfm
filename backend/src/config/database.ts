import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Database configuration and connection management
 * Provides a singleton instance of PrismaClient with proper error handling
 */
export class Database {
  private static instance: PrismaClient | null = null;

  /**
   * Get or create a PrismaClient instance
   * @returns {PrismaClient} The database client instance
   */
  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: [
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'event',
            level: 'error',
          },
          {
            emit: 'event',
            level: 'info',
          },
          {
            emit: 'event',
            level: 'warn',
          },
        ],
      });

      // Set up event listeners for logging
      const client = Database.instance as any;
      
      client.$on('query', (e: any) => {
        logger.debug('Database query', {
          query: e.query,
          params: e.params,
          duration: e.duration,
        });
      });

      client.$on('error', (e: any) => {
        logger.error('Database error', {
          message: e.message,
          target: e.target,
        });
      });

      client.$on('info', (e: any) => {
        logger.info('Database info', {
          message: e.message,
          target: e.target,
        });
      });

      client.$on('warn', (e: any) => {
        logger.warn('Database warning', {
          message: e.message,
          target: e.target,
        });
      });
    }

    return Database.instance;
  }

  /**
   * Connect to the database
   * @returns {Promise<void>}
   */
  public static async connect(): Promise<void> {
    try {
      const client = Database.getInstance();
      await client.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database', { error });
      throw error;
    }
  }

  /**
   * Disconnect from the database
   * @returns {Promise<void>}
   */
  public static async disconnect(): Promise<void> {
    try {
      if (Database.instance) {
        await Database.instance.$disconnect();
        Database.instance = null;
        logger.info('Database disconnected successfully');
      }
    } catch (error) {
      logger.error('Failed to disconnect from database', { error });
      throw error;
    }
  }

  /**
   * Check database connection health
   * @returns {Promise<boolean>} True if connection is healthy
   */
  public static async healthCheck(): Promise<boolean> {
    try {
      const client = Database.getInstance();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', { error });
      return false;
    }
  }
}

// Export the singleton instance
export const db = Database.getInstance();

// Export utility functions
export const connectDatabase = Database.connect;
export const disconnectDatabase = Database.disconnect;
export const checkDatabaseHealth = Database.healthCheck;