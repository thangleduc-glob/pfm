/**
 * Unit tests for user repository
 */

import { UserRepository } from '../../../src/repositories/userRepository';
import { SafeUser, RegisterRequest } from '../../../src/types/auth';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock database
jest.mock('../../../src/config/database', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockPrisma: any;

  beforeEach(() => {
    userRepository = new UserRepository();
    mockPrisma = (userRepository as any).prisma;
    jest.clearAllMocks();
  });

  const mockUser: SafeUser = {
    id: 'user-123',
    username: 'testuser',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockUserWithPassword = {
    ...mockUser,
    passwordHash: 'hashed-password',
  };

  describe('findById', () => {
    it('should find user by ID', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userRepository.findById('user-123');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findById('user-123')).rejects.toThrow('Failed to find user');
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userRepository.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should return null if username not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findByUsername('testuser')).rejects.toThrow('Failed to find user');
    });
  });

  describe('findByUsernameWithPassword', () => {
    it('should find user with password hash', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithPassword);

      const result = await userRepository.findByUsernameWithPassword('testuser');

      expect(result).toEqual(mockUserWithPassword);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findByUsernameWithPassword('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findByUsernameWithPassword('testuser')).rejects.toThrow('Failed to find user');
    });
  });

  describe('create', () => {
    const userData: RegisterRequest = {
      username: 'newuser',
      password: 'hashed-password',
    };

    it('should create a new user', async () => {
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await userRepository.create(userData);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          username: userData.username,
          passwordHash: userData.password,
        },
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw error for duplicate username', async () => {
      const error = new Error('Unique constraint failed');
      mockPrisma.user.create.mockRejectedValue(error);

      await expect(userRepository.create(userData)).rejects.toThrow('Username already exists');
    });

    it('should handle database errors', async () => {
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.create(userData)).rejects.toThrow('Failed to create user');
    });
  });

  describe('existsByUsername', () => {
    it('should return true if username exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-123' });

      const result = await userRepository.existsByUsername('testuser');

      expect(result).toBe(true);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: { id: true },
      });
    });

    it('should return false if username does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.existsByUsername('nonexistent');

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.existsByUsername('testuser')).rejects.toThrow('Failed to check username');
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      mockPrisma.user.update.mockResolvedValue(mockUser);

      await userRepository.updateLastLogin('user-123');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { updatedAt: expect.any(Date) },
      });
    });

    it('should not throw error on failure', async () => {
      mockPrisma.user.update.mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(userRepository.updateLastLogin('user-123')).resolves.toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockPrisma.user.delete.mockResolvedValue(mockUser);

      await userRepository.delete('user-123');

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.user.delete.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.delete('user-123')).rejects.toThrow('Failed to delete user');
    });
  });
});