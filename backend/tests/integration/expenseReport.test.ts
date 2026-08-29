/**
 * Integration tests for expense report endpoints
 * Tests the complete API flow for expense report generation
 */

import request from 'supertest';
import { setupTestApp, cleanupTestApp } from '../helpers/testApp';
import { createTestUser, createTestCategory, createTestTransaction } from '../helpers/testData';
import { PrismaClient } from '@prisma/client';

describe('Expense Report Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let categoryId1: string;
  let categoryId2: string;
  let prisma: PrismaClient;
  let app: any;

  beforeAll(async () => {
    // Setup test app
    const testApp = await setupTestApp();
    app = testApp.app;
    prisma = testApp.prisma;

    // Create test user
    const user = await createTestUser(prisma, 'testuser', 'testpassword123');
    userId = user.id;

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: user.username,
        password: 'testpassword123'
      });

    authToken = loginResponse.body.data.token;

    // Create test categories
    const category1 = await createTestCategory(prisma, userId, 'Food', 'EXPENSE');
    const category2 = await createTestCategory(prisma, userId, 'Transport', 'EXPENSE');
    categoryId1 = category1.id;
    categoryId2 = category2.id;

    // Create test transactions
    await createTestTransaction(prisma, userId, categoryId1, 100.00, 'EXPENSE');
    await createTestTransaction(prisma, userId, categoryId1, 50.00, 'EXPENSE');
    await createTestTransaction(prisma, userId, categoryId2, 200.00, 'EXPENSE');
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.transaction.deleteMany({
      where: { userId }
    });
    await prisma.category.deleteMany({
      where: { userId }
    });
    await prisma.user.delete({
      where: { id: userId }
    });
    
    // Cleanup test app
    await cleanupTestApp(prisma, null);
  });

  describe('GET /api/v1/reports/expenses', () => {
    it('should generate expense report successfully', async () => {
      const response = await request(app)
        .get('/api/v1/reports/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('categories');
      expect(response.body.data).toHaveProperty('grandTotal');
      expect(response.body.data).toHaveProperty('totalTransactions');
      expect(response.body.data).toHaveProperty('generatedAt');

      // Verify report data
      const { categories, grandTotal, totalTransactions } = response.body.data;
      
      expect(categories).toHaveLength(2);
      expect(grandTotal).toBe(350.00);
      expect(totalTransactions).toBe(3);

      // Verify categories are sorted by total amount (highest first)
      expect(categories[0].categoryName).toBe('Transport');
      expect(categories[0].totalAmount).toBe(200.00);
      expect(categories[0].transactionCount).toBe(1);
      
      expect(categories[1].categoryName).toBe('Food');
      expect(categories[1].totalAmount).toBe(150.00);
      expect(categories[1].transactionCount).toBe(2);

      // Verify percentages
      expect(categories[0].percentage).toBe((200.00 / 350.00) * 100);
      expect(categories[1].percentage).toBe((150.00 / 350.00) * 100);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/reports/expenses')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not authenticated');
    });

    it('should filter by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await request(app)
        .get('/api/v1/reports/expenses')
        .query({
          startDate: yesterday.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toHaveLength(2);
      expect(response.body.data.grandTotal).toBe(350.00);
    });

    it('should filter by category IDs', async () => {
      const response = await request(app)
        .get('/api/v1/reports/expenses')
        .query({
          categoryIds: categoryId1
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toHaveLength(1);
      expect(response.body.data.categories[0].categoryId).toBe(categoryId1);
      expect(response.body.data.categories[0].totalAmount).toBe(150.00);
      expect(response.body.data.grandTotal).toBe(150.00);
    });

    it('should return empty report for user with no transactions', async () => {
      // Create another user with no transactions
      const newUser = await createTestUser(prisma, 'testuser2', 'testpassword123');
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: newUser.username,
          password: 'testpassword123'
        });

      const newAuthToken = loginResponse.body.data.token;

      const response = await request(app)
        .get('/api/v1/reports/expenses')
        .set('Authorization', `Bearer ${newAuthToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toHaveLength(0);
      expect(response.body.data.grandTotal).toBe(0);
      expect(response.body.data.totalTransactions).toBe(0);

      // Clean up
      await prisma.user.delete({
        where: { id: newUser.id }
      });
    });

    it('should validate date format', async () => {
      const response = await request(app)
        .get('/api/v1/reports/expenses')
        .query({
          startDate: 'invalid-date'
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should validate date range', async () => {
      const response = await request(app)
        .get('/api/v1/reports/expenses')
        .query({
          startDate: '2024-01-31',
          endDate: '2024-01-01'
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Start date must be before end date');
    });
  });
});