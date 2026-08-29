/**
 * Dashboard API integration tests
 * Tests all dashboard endpoints with happy case scenarios
 */

import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { setupTestApp, cleanupTestApp } from '../helpers/testApp';
import { authService } from '../../src/services/authService';
import { CategoryService } from '../../src/services/categoryService';
import { TransactionService } from '../../src/services/transactionService';

describe('Dashboard API Integration Tests', () => {
  let app: Express;
  let prisma: PrismaClient;
  let server: any;
  let authToken: string;
  let userId: string;
  let incomeCategoryId: string;
  let expenseCategoryId: string;
  let categoryService: CategoryService;
  let transactionService: TransactionService;

  beforeAll(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    prisma = setup.prisma;
    server = setup.server;
    categoryService = new CategoryService();
    transactionService = new TransactionService();

    // Create a test user and get auth token
    const user = await authService.register({
      username: 'dashboardtest',
      password: 'TestPass123',
    });
    userId = user.user.id;
    
    // Login to get auth token
    const loginResult = await authService.login({
      username: 'dashboardtest',
      password: 'TestPass123',
    });
    authToken = loginResult.accessToken;

    // Create test categories
    const incomeCategory = await categoryService.create(userId, {
      name: 'Salary',
      type: 'INCOME',
    });
    incomeCategoryId = incomeCategory.id;

    const expenseCategory = await categoryService.create(userId, {
      name: 'Rent',
      type: 'EXPENSE',
    });
    expenseCategoryId = expenseCategory.id;

    // Create test transactions for current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Create income transaction
    await transactionService.create(userId, {
      amount: 5000,
      categoryId: incomeCategoryId,
      date: new Date(currentYear, currentMonth, 15),
      type: 'INCOME',
      note: 'Monthly salary'
    });

    // Create expense transactions
    await transactionService.create(userId, {
      amount: 1500,
      categoryId: expenseCategoryId,
      date: new Date(currentYear, currentMonth, 1),
      type: 'EXPENSE',
      note: 'Monthly rent'
    });

    await transactionService.create(userId, {
      amount: 500,
      categoryId: expenseCategoryId,
      date: new Date(currentYear, currentMonth, 10),
      type: 'EXPENSE',
      note: 'Utilities'
    });

    // Create transaction from previous month for testing current month calculations
    await transactionService.create(userId, {
      amount: 4000,
      categoryId: incomeCategoryId,
      date: new Date(currentYear, currentMonth - 1, 15),
      type: 'INCOME',
      note: 'Previous month salary'
    });
  });

  afterAll(async () => {
    await cleanupTestApp(prisma, server);
  });

  describe('GET /api/v1/dashboard', () => {
    it('should return complete dashboard data', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');

      const data = response.body.data;
      expect(data).toHaveProperty('currentBalance');
      expect(data).toHaveProperty('currentMonthIncome');
      expect(data).toHaveProperty('currentMonthExpenses');
      expect(data).toHaveProperty('remainingAmount');

      // Verify calculations based on test data
      expect(data.currentBalance).toBe(5000 - 1500 - 500 + 4000); // 7000
      expect(data.currentMonthIncome).toBe(5000);
      expect(data.currentMonthExpenses).toBe(2000);
      expect(data.remainingAmount).toBe(3000);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/dashboard')
        .expect(401);
    });
  });

  describe('GET /api/v1/dashboard/balance', () => {
    it('should return current balance', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('balance');

      // Should be total income - total expenses
      expect(response.body.data.balance).toBe(7000);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/dashboard/balance')
        .expect(401);
    });
  });

  describe('GET /api/v1/dashboard/income', () => {
    it('should return current month income', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/income')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('income');

      // Should be current month income only
      expect(response.body.data.income).toBe(5000);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/dashboard/income')
        .expect(401);
    });
  });

  describe('GET /api/v1/dashboard/expenses', () => {
    it('should return current month expenses', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('expenses');

      // Should be current month expenses only
      expect(response.body.data.expenses).toBe(2000);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/dashboard/expenses')
        .expect(401);
    });
  });

  describe('GET /api/v1/dashboard/remaining', () => {
    it('should return current month remaining amount', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/remaining')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('remaining');

      // Should be current month income - current month expenses
      expect(response.body.data.remaining).toBe(3000);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/dashboard/remaining')
        .expect(401);
    });
  });
});