/**
 * Test app setup helper
 * Creates and configures an Express app for testing
 */

import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { authRoutes } from '../../src/routes/auth';
import { categoryRoutes } from '../../src/routes/categories';
import { transactionRoutes } from '../../src/routes/transactions';
import { logger } from '../../src/utils/logger';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-long-enough-for-testing';
process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.DATABASE_URL = 'mysql://root:12345678@localhost:3306/pfm_test';

/**
 * Setup test app with all middleware and routes
 * @returns Object with app, prisma client, and server instance
 */
export async function setupTestApp() {
  // Initialize Express app
  const app: Express = express();
  
  // Initialize Prisma client
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'mysql://root:12345678@localhost:3306/pfm_test',
      },
    },
  });

  // Connect to database
  await prisma.$connect();

  // Configure middleware
  app.use(helmet());
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Add request logging for tests
  app.use((req, _res, next) => {
    logger.debug('Test request', {
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/transactions', transactionRoutes);

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Test app error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'NOT_FOUND',
    });
  });

  // Start server on random port for testing
  const server = app.listen(0); // 0 means random available port

  return {
    app,
    prisma,
    server,
  };
}

/**
 * Cleanup test app and database connection
 * @param prisma - Prisma client instance
 * @param server - Server instance to close
 */
export async function cleanupTestApp(prisma: PrismaClient, server: any) {
  try {
    // Close server
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Disconnect from database
    if (prisma) {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
}