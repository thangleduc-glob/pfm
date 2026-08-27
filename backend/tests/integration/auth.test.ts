/**
 * Authentication integration tests
 * Tests the complete authentication flow including register, login, logout
 */

import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { setupTestApp, cleanupTestApp } from '../helpers/testApp';
import { createTestUser, clearTestUsers } from '../helpers/testData';

describe('Authentication Integration Tests', () => {
  let app: Express;
  let prisma: PrismaClient;
  let server: any;

  beforeAll(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    prisma = setup.prisma;
    server = setup.server;
  });

  afterAll(async () => {
    await cleanupTestApp(prisma, server);
  });

  beforeEach(async () => {
    await clearTestUsers(prisma);
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        password: 'TestPassword123',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).toHaveProperty('updatedAt');
      expect(response.body.user).not.toHaveProperty('password');

      // Check if cookies are set
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = (response.headers['set-cookie'] as unknown) as string[];
      expect(cookies.some((cookie: string) => cookie.startsWith('accessToken='))).toBe(true);
      expect(cookies.some((cookie: string) => cookie.startsWith('refreshToken='))).toBe(true);

      // Verify user exists in database
      const user = await prisma.user.findUnique({
        where: { username: userData.username },
      });
      expect(user).toBeTruthy();
      expect(user?.username).toBe(userData.username);
    });

    it('should return 409 when username already exists', async () => {
      // Create a user first
      await createTestUser(prisma, 'existinguser', 'ExistingPassword123');

      const userData = {
        username: 'existinguser',
        password: 'TestPassword123',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Authentication Error');
      expect(response.body).toHaveProperty('message', 'Username already exists');
      expect(response.body).toHaveProperty('code', 'USERNAME_EXISTS');
    });

    it('should return 400 for invalid username', async () => {
      const userData = {
        username: '', // Empty username
        password: 'TestPassword123',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'username',
            message: expect.any(String),
          }),
        ])
      );
    });

    it('should return 400 for invalid password', async () => {
      const userData = {
        username: 'testuser',
        password: '123', // Too short
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await createTestUser(prisma, 'testuser', 'TestPassword123');
    });

    it('should login successfully with valid credentials', async () => {
      const credentials = {
        username: 'testuser',
        password: 'TestPassword123',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.user).toHaveProperty('username', credentials.username);
      expect(response.body.user).not.toHaveProperty('password');

      // Check if cookies are set
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = (response.headers['set-cookie'] as unknown) as string[];
      expect(cookies.some((cookie: string) => cookie.startsWith('accessToken='))).toBe(true);
      expect(cookies.some((cookie: string) => cookie.startsWith('refreshToken='))).toBe(true);
    });

    it('should return 401 for invalid username', async () => {
      const credentials = {
        username: 'nonexistentuser',
        password: 'TestPassword123',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication Error');
      expect(response.body).toHaveProperty('message', 'Invalid username or password');
      expect(response.body).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });

    it('should return 401 for invalid password', async () => {
      const credentials = {
        username: 'testuser',
        password: 'WrongPassword123',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication Error');
      expect(response.body).toHaveProperty('message', 'Invalid username or password');
      expect(response.body).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

});