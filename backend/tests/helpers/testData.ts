/**
 * Test data helpers
 * Provides utilities for creating and managing test data
 */

import { PrismaClient, User } from '@prisma/client';
import { hashPassword } from '../../src/utils/encryption';

/**
 * Create a test user in the database
 * @param prisma - Prisma client instance
 * @param username - Username for the test user
 * @param password - Plain text password (will be hashed)
 * @returns Promise<User> - Created user
 */
export async function createTestUser(
  prisma: PrismaClient,
  username: string,
  password: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  
  return prisma.user.create({
    data: {
      username,
      passwordHash,
    },
  });
}

/**
 * Create multiple test users
 * @param prisma - Prisma client instance
 * @param users - Array of user data
 * @returns Promise<User[]> - Created users
 */
export async function createTestUsers(
  prisma: PrismaClient,
  users: Array<{ username: string; password: string }>
): Promise<User[]> {
  const createdUsers: User[] = [];
  
  for (const user of users) {
    const createdUser = await createTestUser(prisma, user.username, user.password);
    createdUsers.push(createdUser);
  }
  
  return createdUsers;
}

/**
 * Clear all test users from the database
 * @param prisma - Prisma client instance
 * @returns Promise<void>
 */
export async function clearTestUsers(prisma: PrismaClient): Promise<void> {
  // Delete all users (this will cascade delete related data)
  await prisma.user.deleteMany({});
}

/**
 * Clear all test data from the database
 * @param prisma - Prisma client instance
 * @returns Promise<void>
 */
export async function clearTestData(prisma: PrismaClient): Promise<void> {
  // Delete in order to respect foreign key constraints
  await prisma.transaction.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
}

/**
 * Create a test category for a user
 * @param prisma - Prisma client instance
 * @param userId - User ID to create category for
 * @param name - Category name
 * @param type - Category type ('INCOME' or 'EXPENSE')
 * @returns Promise<Category> - Created category
 */
export async function createTestCategory(
  prisma: PrismaClient,
  userId: string,
  name: string,
  type: 'INCOME' | 'EXPENSE'
) {
  return prisma.category.create({
    data: {
      name,
      type,
      userId,
    },
  });
}

/**
 * Create a test transaction for a user
 * @param prisma - Prisma client instance
 * @param userId - User ID to create transaction for
 * @param categoryId - Category ID for the transaction
 * @param amount - Transaction amount
 * @param type - Transaction type ('INCOME' or 'EXPENSE')
 * @param date - Transaction date
 * @param note - Optional transaction note
 * @returns Promise<Transaction> - Created transaction
 */
export async function createTestTransaction(
  prisma: PrismaClient,
  userId: string,
  categoryId: string,
  amount: number,
  type: 'INCOME' | 'EXPENSE',
  date: Date = new Date(),
  note?: string
) {
  return prisma.transaction.create({
    data: {
      amount,
      type,
      date,
      note: note || null,
      userId,
      categoryId,
    },
  });
}

/**
 * Get test user by username
 * @param prisma - Prisma client instance
 * @param username - Username to find
 * @returns Promise<User | null> - User or null if not found
 */
export async function getTestUser(
  prisma: PrismaClient,
  username: string
): Promise<User | null> {
  return prisma.user.findUnique({
    where: { username },
  });
}

/**
 * Count test users in database
 * @param prisma - Prisma client instance
 * @returns Promise<number> - Number of users
 */
export async function countTestUsers(prisma: PrismaClient): Promise<number> {
  return prisma.user.count();
}

/**
 * Generate a random test username
 * @param prefix - Optional prefix for the username
 * @returns string - Random username
 */
export function generateTestUsername(prefix: string = 'testuser'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate a random test password
 * @returns string - Random password that meets validation requirements
 */
export function generateTestPassword(): string {
  const timestamp = Date.now().toString();
  return `Test${timestamp}!`;
}