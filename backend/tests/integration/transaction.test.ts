/**
 * Transaction API integration tests
 * Tests all transaction endpoints with happy case scenarios
 */

import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { setupTestApp, cleanupTestApp } from '../helpers/testApp';
import { authService } from '../../src/services/authService';
import { CategoryService } from '../../src/services/categoryService';

describe('Transaction API Integration Tests', () => {
  let app: Express;
  let prisma: PrismaClient;
  let server: any;
  let authToken: string;
  let userId: string;
  let categoryId: string;
  let incomeCategoryId: string;
  let transactionId: string;
  let categoryService: CategoryService;

  beforeAll(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    prisma = setup.prisma;
    server = setup.server;
    categoryService = new CategoryService();

    // Create a test user and get auth token
    const user = await authService.register({
      username: 'transactiontest',
      password: 'TestPass123',
    });
    userId = user.user.id;
    
    // Login to get auth token
    const loginResult = await authService.login({
      username: 'transactiontest',
      password: 'TestPass123',
    });
    authToken = loginResult.accessToken;

    // Create test categories
    const expenseCategory = await categoryService.create(userId, {
      name: 'Test Expense Category',
      type: 'EXPENSE',
    });
    categoryId = expenseCategory.id;

    const incomeCategory = await categoryService.create(userId, {
      name: 'Test Income Category',
      type: 'INCOME',
    });
    incomeCategoryId = incomeCategory.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.transaction.deleteMany({
      where: { userId },
    });
    await prisma.category.deleteMany({
      where: { userId },
    });
    await prisma.user.delete({
      where: { id: userId },
    });
    await cleanupTestApp(prisma, server);
  });

  describe('POST /api/v1/transactions', () => {
    it('should create a new expense transaction', async () => {
      const transactionData = {
        amount: 50.99,
        categoryId,
        date: '2024-01-15',
        type: 'EXPENSE',
        note: 'Test expense transaction',
      };

      const response = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', `accessToken=${authToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body).toHaveProperty('transaction');
      expect(response.body).toHaveProperty('message', 'Transaction created successfully');
      expect(response.body.transaction.amount).toBe(transactionData.amount);
      expect(response.body.transaction.categoryId).toBe(categoryId);
      expect(response.body.transaction.type).toBe('EXPENSE');
      expect(response.body.transaction.note).toBe(transactionData.note);
      expect(response.body.transaction).toHaveProperty('category');
      expect(response.body.transaction.category.name).toBe('Test Expense Category');
      
      transactionId = response.body.transaction.id;
    });

    it('should create a new income transaction', async () => {
      const transactionData = {
        amount: 1000.00,
        categoryId: incomeCategoryId,
        date: '2024-01-01',
        type: 'INCOME',
        note: 'Test income transaction',
      };

      const response = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', `accessToken=${authToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body).toHaveProperty('transaction');
      expect(response.body.transaction.type).toBe('INCOME');
      expect(response.body.transaction.category.name).toBe('Test Income Category');
    });

    it('should return 401 without authentication', async () => {
      const transactionData = {
        amount: 50.99,
        categoryId,
        date: '2024-01-15',
        type: 'EXPENSE',
      };

      await request(app)
        .post('/api/v1/transactions')
        .send(transactionData)
        .expect(401);
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('should get all transactions for the user', async () => {
      const response = await request(app)
        .get('/api/v1/transactions')
        .set('Cookie', `accessToken=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.transactions)).toBe(true);
      expect(response.body.transactions.length).toBeGreaterThan(0);
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('offset');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('hasMore');
    });

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/v1/transactions?type=EXPENSE')
        .set('Cookie', `accessToken=${authToken}`)
        .expect(200);

      expect(response.body.transactions.every((t: any) => t.type === 'EXPENSE')).toBe(true);
    });

    it('should filter transactions by category', async () => {
      const response = await request(app)
        .get(`/api/v1/transactions?categoryId=${categoryId}`)
        .set('Cookie', `accessToken=${authToken}`)
        .expect(200);

      expect(response.body.transactions.every((t: any) => t.categoryId === categoryId)).toBe(true);
    });

    it('should filter transactions by date range', async () => {
      const response = await request(app)
        .get('/api/v1/transactions?startDate=2024-01-01&endDate=2024-01-31')
        .set('Cookie', `accessToken=${authToken}`)
        .expect(200);

      expect(response.body.transactions.length).toBeGreaterThan(0);
    });

    it('should paginate transactions correctly', async () => {
      // Create additional transactions for pagination testing
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/transactions')
          .set('Cookie', `accessToken=${authToken}`)
          .send({
            amount: 10 + i,
            categoryId,
            date: '2024-01-20',
            type: 'EXPENSE',
            note: `Test transaction ${i}`,
          });
      }

      const response = await request(app)
        .get('/api/v1/transactions?limit=2&offset=0')
        .set('Cookie', `accessToken=${authToken}`)
        .expect(200);

      expect(response.body.transactions.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.offset).toBe(0);
      expect(response.body.pagination.hasMore).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/transactions')
        .expect(401);
    });
  });

  describe('GET /api/v1/transactions/:id', () => {
    it('should get a specific transaction by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/transactions/${transactionId}`)
        .set('Cookie', `accessToken=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transaction');
      expect(response.body.transaction.id).toBe(transactionId);
      expect(response.body.transaction).toHaveProperty('category');
    });

    it('should return 404 for non-existent transaction', async () => {
      const fakeId = 'non-existent-id';
      await request(app)
        .get(`/api/v1/transactions/${fakeId}`)
        .set('Cookie', `accessToken=${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get(`/api/v1/transactions/${transactionId}`)
        .expect(401);
    });
  });

  describe('PUT /api/v1/transactions/:id', () => {
    it('should update a transaction', async () => {
      const updateData = {
        amount: 75.99,
        note: 'Updated test transaction',
      };

      const response = await request(app)
        .put(`/api/v1/transactions/${transactionId}`)
        .set('Cookie', `accessToken=${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('transaction');
      expect(response.body).toHaveProperty('message', 'Transaction updated successfully');
      expect(response.body.transaction.amount).toBe(updateData.amount);
      expect(response.body.transaction.note).toBe(updateData.note);
    });

    it('should return 404 for non-existent transaction', async () => {
      const fakeId = 'non-existent-id';
      await request(app)
        .put(`/api/v1/transactions/${fakeId}`)
        .set('Cookie', `accessToken=${authToken}`)
        .send({ amount: 100 })
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .put(`/api/v1/transactions/${transactionId}`)
        .send({ amount: 100 })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/transactions/:id', () => {
    it('should delete a transaction', async () => {
      const response = await request(app)
        .delete(`/api/v1/transactions/${transactionId}`)
        .set('Cookie', `accessToken=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Transaction deleted successfully');

      // Verify transaction is deleted
      await request(app)
        .get(`/api/v1/transactions/${transactionId}`)
        .set('Cookie', `accessToken=${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent transaction', async () => {
      const fakeId = 'non-existent-id';
      await request(app)
        .delete(`/api/v1/transactions/${fakeId}`)
        .set('Cookie', `accessToken=${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .delete(`/api/v1/transactions/${transactionId}`)
        .expect(401);
    });
  });
});