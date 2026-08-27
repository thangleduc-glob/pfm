/**
 * User repository for data access operations
 * Handles all database interactions for user entities
 */

import { PrismaClient, User } from '@prisma/client';
import { SafeUser, RegisterRequest, IUserService } from '../types/auth';
import { logger } from '../utils/logger';
import { db } from '../config/database';

/**
 * User repository implementation using Prisma ORM
 */
export class UserRepository implements IUserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = db;
  }

  /**
   * Find a user by their ID
   * @param id - The user ID to search for
   * @returns Promise<SafeUser | null> - The user without password, or null if not found
   */
  async findById(id: string): Promise<SafeUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.debug('User lookup by ID', { id, found: !!user });
      return user;
    } catch (error) {
      logger.error('Failed to find user by ID', { 
        id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find a user by their username
   * @param username - The username to search for
   * @returns Promise<SafeUser | null> - The user without password, or null if not found
   */
  async findByUsername(username: string): Promise<SafeUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.debug('User lookup by username', { username, found: !!user });
      return user;
    } catch (error) {
      logger.error('Failed to find user by username', { 
        username, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find a user with their password hash (for authentication)
   * @param username - The username to search for
   * @returns Promise<User | null> - The user with password hash, or null if not found
   */
  async findByUsernameWithPassword(username: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });

      logger.debug('User lookup with password', { username, found: !!user });
      return user;
    } catch (error) {
      logger.error('Failed to find user with password', { 
        username, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error('Failed to find user');
    }
  }

  /**
   * Create a new user
   * @param userData - The user registration data
   * @returns Promise<SafeUser> - The created user without password
   */
  async create(userData: RegisterRequest): Promise<SafeUser> {
    try {
      const user = await this.prisma.user.create({
        data: {
          username: userData.username,
          passwordHash: userData.password, // Password should be hashed before calling this
        },
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info('User created successfully', { userId: user.id, username: user.username });
      return user;
    } catch (error) {
      // Check for unique constraint violation
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        logger.warn('Username already exists', { username: userData.username });
        throw new Error('Username already exists');
      }

      logger.error('Failed to create user', { 
        username: userData.username,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error('Failed to create user');
    }
  }

  /**
   * Check if a username already exists
   * @param username - The username to check
   * @returns Promise<boolean> - True if username exists, false otherwise
   */
  async existsByUsername(username: string): Promise<boolean> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      const exists = !!existingUser;
      logger.debug('Username existence check', { username, exists });
      return exists;
    } catch (error) {
      logger.error('Failed to check username existence', { 
        username, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error('Failed to check username');
    }
  }

  /**
   * Update a user's last login timestamp
   * @param userId - The user ID to update
   * @returns Promise<void>
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() },
      });

      logger.debug('User last login updated', { userId });
    } catch (error) {
      logger.error('Failed to update last login', { 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      // Don't throw error here as it's not critical
    }
  }

  /**
   * Delete a user (soft delete by updating username)
   * @param userId - The user ID to delete
   * @returns Promise<void>
   */
  async delete(userId: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: userId },
      });

      logger.info('User deleted successfully', { userId });
    } catch (error) {
      logger.error('Failed to delete user', { 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error('Failed to delete user');
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();