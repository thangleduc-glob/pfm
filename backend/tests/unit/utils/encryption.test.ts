/**
 * Unit tests for encryption utilities
 */

import { 
  hashPassword, 
  verifyPassword, 
  generateSalt,
  hashPasswordSync,
  verifyPasswordSync 
} from '../../../src/utils/encryption';

describe('Encryption Utils', () => {
  const testPassword = 'TestPassword123';

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const hashedPassword = await hashPassword(testPassword);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(testPassword);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for the same password', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should use at least 12 rounds', async () => {
      const hashedPassword = await hashPassword(testPassword);
      
      // bcrypt hashes start with $2b$ for version 2b
      // The rounds are encoded after the version: $2b$12$ for 12 rounds
      expect(hashedPassword).toMatch(/^\$2b\$(1[2-9]|[2-9][0-9])\$/);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await hashPassword('');
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe('');
    });

    it('should throw error for invalid input', async () => {
      await expect(hashPassword(null as any)).rejects.toThrow();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isValid = await verifyPassword(testPassword, hashedPassword);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isValid = await verifyPassword('WrongPassword', hashedPassword);
      
      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await hashPassword('');
      const isValid = await verifyPassword('', hashedPassword);
      
      expect(isValid).toBe(true);
    });

    it('should reject empty hash', async () => {
      const isValid = await verifyPassword(testPassword, '');
      expect(isValid).toBe(false);
    });

    it('should reject invalid hash format', async () => {
      const isValid = await verifyPassword(testPassword, 'invalid-hash');
      expect(isValid).toBe(false);
    });
  });

  describe('generateSalt', () => {
    it('should generate a salt with default rounds', async () => {
      const salt = await generateSalt();
      
      expect(salt).toBeDefined();
      expect(salt).toMatch(/^\$2b\$12\$/);
    });

    it('should generate a salt with custom rounds', async () => {
      const salt = await generateSalt(14);
      
      expect(salt).toBeDefined();
      expect(salt).toMatch(/^\$2b\$14\$/);
    });

    it('should generate different salts', async () => {
      const salt1 = await generateSalt();
      const salt2 = await generateSalt();
      
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('hashPasswordSync', () => {
    it('should hash password synchronously', () => {
      const salt = '$2b$12$abcdefghijklmnopqrstuu';
      const hashedPassword = hashPasswordSync(testPassword, salt);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(testPassword);
      expect(hashedPassword).toContain(salt);
    });

    it('should throw error for invalid salt', () => {
      expect(() => hashPasswordSync(testPassword, 'invalid-salt')).toThrow();
    });
  });

  describe('verifyPasswordSync', () => {
    it('should verify password synchronously', () => {
      const salt = '$2b$12$abcdefghijklmnopqrstuv';
      const hashedPassword = hashPasswordSync(testPassword, salt);
      const isValid = verifyPasswordSync(testPassword, hashedPassword);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password synchronously', () => {
      const salt = '$2b$12$abcdefghijklmnopqrstuv';
      const hashedPassword = hashPasswordSync(testPassword, salt);
      const isValid = verifyPasswordSync('WrongPassword', hashedPassword);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('should hash and verify password consistently', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isValid = await verifyPassword(testPassword, hashedPassword);
      
      expect(isValid).toBe(true);
    });

    it('should handle special characters', async () => {
      const specialPassword = 'P@$$w0rd!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hashedPassword = await hashPassword(specialPassword);
      const isValid = await verifyPassword(specialPassword, hashedPassword);
      
      expect(isValid).toBe(true);
    });

    it('should handle unicode characters', async () => {
      const unicodePassword = '🔐🔑🔒Password123';
      const hashedPassword = await hashPassword(unicodePassword);
      const isValid = await verifyPassword(unicodePassword, hashedPassword);
      
      expect(isValid).toBe(true);
    });
  });
});