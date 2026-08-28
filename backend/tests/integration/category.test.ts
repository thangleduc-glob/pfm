/**
 * Category integration tests
 * Tests the complete category CRUD operations
 */

import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { setupTestApp, cleanupTestApp } from '../helpers/testApp';
import { createTestUser, createTestCategory, clearTestData } from '../helpers/testData';

describe('Category Integration Tests', () => {
  let app: Express;
  let prisma: PrismaClient;
  let server: any;
  let testUser: any;
  let authCookies: string[];

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
    await clearTestData(prisma);
    
    // Create a test user and authenticate
    testUser = await createTestUser(prisma, 'testuser', 'TestPassword123');
    
    // Login to get authentication cookies
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'testuser',
        password: 'TestPassword123',
      })
      .expect(200);
    
    authCookies = (loginResponse.headers['set-cookie'] as unknown) as string[];
  });

  describe('GET /api/v1/categories', () => {
    it('should return empty categories list for new user', async () => {
      const response = await request(app)
        .get('/api/v1/categories')
        .set('Cookie', authCookies)
        .expect(200);

      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body.categories).toEqual([]);
    });

    it('should return user categories', async () => {
      // Create test categories
      await createTestCategory(prisma, testUser.id, 'Salary', 'INCOME');
      await createTestCategory(prisma, testUser.id, 'Food', 'EXPENSE');

      const response = await request(app)
        .get('/api/v1/categories')
        .set('Cookie', authCookies)
        .expect(200);

      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body.categories).toHaveLength(2);
      
      // Check category structure
      response.body.categories.forEach((category: any) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('userId', testUser.id);
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('type');
        expect(category).toHaveProperty('createdAt');
        expect(category).toHaveProperty('updatedAt');
      });
    });
  });

  describe('POST /api/v1/categories', () => {
    it('should create a new income category', async () => {
      const categoryData = {
        name: 'Salary',
        type: 'income',
      };

      const response = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', authCookies)
        .send(categoryData)
        .expect(201);

      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('message', 'Category created successfully');
      expect(response.body.category).toHaveProperty('id');
      expect(response.body.category).toHaveProperty('userId', testUser.id);
      expect(response.body.category).toHaveProperty('name', categoryData.name);
      expect(response.body.category).toHaveProperty('type', categoryData.type);
      expect(response.body.category).toHaveProperty('createdAt');
      expect(response.body.category).toHaveProperty('updatedAt');
    });

    it('should create a new expense category', async () => {
      const categoryData = {
        name: 'Food',
        type: 'expense',
      };

      const response = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', authCookies)
        .send(categoryData)
        .expect(201);

      expect(response.body).toHaveProperty('category');
      expect(response.body.category).toHaveProperty('name', categoryData.name);
      expect(response.body.category).toHaveProperty('type', categoryData.type);
    });

    it('should return 409 for duplicate category name and type', async () => {
      // Create a category first
      await createTestCategory(prisma, testUser.id, 'Salary', 'INCOME');

      const categoryData = {
        name: 'Salary',
        type: 'income',
      };

      const response = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', authCookies)
        .send(categoryData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Category already exists');
      expect(response.body).toHaveProperty('code', 'DUPLICATE_CATEGORY');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: 'Category with this name and type already exists',
          }),
        ])
      );
    });

    it('should return 400 for invalid category data', async () => {
      const categoryData = {
        name: '', // Empty name
        type: 'invalid', // Invalid type
      };

      const response = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', authCookies)
        .send(categoryData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should return a category by ID', async () => {
      // Create a test category
      const category = await createTestCategory(prisma, testUser.id, 'Salary', 'INCOME');

      const response = await request(app)
        .get(`/api/v1/categories/${category.id}`)
        .set('Cookie', authCookies)
        .expect(200);

      expect(response.body).toHaveProperty('category');
      expect(response.body.category).toHaveProperty('id', category.id);
      expect(response.body.category).toHaveProperty('userId', testUser.id);
      expect(response.body.category).toHaveProperty('name', 'Salary');
      expect(response.body.category).toHaveProperty('type', 'INCOME');
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/api/v1/categories/${fakeId}`)
        .set('Cookie', authCookies)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Category not found');
      expect(response.body).toHaveProperty('code', 'CATEGORY_NOT_FOUND');
    });

    it('should return 404 for category owned by another user', async () => {
      // Create another user
      const otherUser = await createTestUser(prisma, 'otheruser', 'OtherPassword123');
      
      // Create a category for the other user
      const otherCategory = await createTestCategory(prisma, otherUser.id, 'Other Salary', 'INCOME');

      const response = await request(app)
        .get(`/api/v1/categories/${otherCategory.id}`)
        .set('Cookie', authCookies)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Category not found');
      expect(response.body).toHaveProperty('code', 'CATEGORY_NOT_FOUND');
    });

    it('should return 400 for invalid category ID', async () => {
      const response = await request(app)
        .get('/api/v1/categories/invalid-id')
        .set('Cookie', authCookies)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('PUT /api/v1/categories/:id', () => {
    it('should update a category', async () => {
      // Create a test category
      const category = await createTestCategory(prisma, testUser.id, 'Salary', 'INCOME');

      const updateData = {
        name: 'Updated Salary',
        type: 'income',
      };

      const response = await request(app)
        .put(`/api/v1/categories/${category.id}`)
        .set('Cookie', authCookies)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('message', 'Category updated successfully');
      expect(response.body.category).toHaveProperty('id', category.id);
      expect(response.body.category).toHaveProperty('name', updateData.name);
      expect(response.body.category).toHaveProperty('type', updateData.type);
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        name: 'Updated Name',
        type: 'income',
      };

      const response = await request(app)
        .put(`/api/v1/categories/${fakeId}`)
        .set('Cookie', authCookies)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Category not found');
      expect(response.body).toHaveProperty('code', 'CATEGORY_NOT_FOUND');
    });

    it('should return 409 for duplicate name and type', async () => {
      // Create two categories
      await createTestCategory(prisma, testUser.id, 'Salary', 'INCOME');
      const category2 = await createTestCategory(prisma, testUser.id, 'Bonus', 'INCOME');

      // Try to update category2 to have the same name as the first category
      const updateData = {
        name: 'Salary',
        type: 'income',
      };

      const response = await request(app)
        .put(`/api/v1/categories/${category2.id}`)
        .set('Cookie', authCookies)
        .send(updateData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Category already exists');
      expect(response.body).toHaveProperty('code', 'DUPLICATE_CATEGORY');
    });

    it('should return 400 for invalid update data', async () => {
      const category = await createTestCategory(prisma, testUser.id, 'Salary', 'INCOME');
      const updateData = {
        name: '', // Empty name
        type: 'invalid', // Invalid type
      };

      const response = await request(app)
        .put(`/api/v1/categories/${category.id}`)
        .set('Cookie', authCookies)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('should delete a category', async () => {
      // Create a test category
      const category = await createTestCategory(prisma, testUser.id, 'Salary', 'INCOME');

      const response = await request(app)
        .delete(`/api/v1/categories/${category.id}`)
        .set('Cookie', authCookies)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Category deleted successfully');

      // Verify category is deleted
      const deletedCategory = await prisma.category.findUnique({
        where: { id: category.id },
      });
      expect(deletedCategory).toBeNull();
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .delete(`/api/v1/categories/${fakeId}`)
        .set('Cookie', authCookies)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Category not found');
      expect(response.body).toHaveProperty('code', 'CATEGORY_NOT_FOUND');
    });

    it('should return 409 when category has transactions', async () => {
      // Create a test category
      const category = await createTestCategory(prisma, testUser.id, 'Salary', 'INCOME');
      
      // Create a transaction for this category
      await prisma.transaction.create({
        data: {
          amount: 1000,
          type: 'INCOME',
          date: new Date(),
          userId: testUser.id,
          categoryId: category.id,
        },
      });

      const response = await request(app)
        .delete(`/api/v1/categories/${category.id}`)
        .set('Cookie', authCookies)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Cannot delete category with existing transactions');
      expect(response.body).toHaveProperty('code', 'CATEGORY_HAS_TRANSACTIONS');
    });

    it('should return 400 for invalid category ID', async () => {
      const response = await request(app)
        .delete('/api/v1/categories/invalid-id')
        .set('Cookie', authCookies)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });
});