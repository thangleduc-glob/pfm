/**
 * Encryption utilities for password hashing and verification
 * Uses bcrypt with minimum 12 rounds for security
 */

import bcrypt from 'bcrypt';
import { logger } from './logger';

/**
 * Hash a password using bcrypt with configured rounds
 * @param password - The plain text password to hash
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    if (rounds < 12) {
      logger.warn('BCrypt rounds should be at least 12 for security', { rounds });
    }
    
    const salt = await bcrypt.genSalt(rounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    logger.debug('Password hashed successfully', { rounds });
    return hashedPassword;
  } catch (error) {
    logger.error('Failed to hash password', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against its hash
 * @param password - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise<boolean> - True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    
    logger.debug('Password verification completed', { isValid });
    return isValid;
  } catch (error) {
    logger.error('Failed to verify password', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error('Failed to verify password');
  }
}

/**
 * Generate a random salt for testing purposes only
 * @param rounds - Number of rounds (default: 12)
 * @returns Promise<string> - The generated salt
 * @deprecated This should only be used in tests
 */
export async function generateSalt(rounds: number = 12): Promise<string> {
  try {
    return await bcrypt.genSalt(rounds);
  } catch (error) {
    logger.error('Failed to generate salt', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error('Failed to generate salt');
  }
}

/**
 * Synchronous password hashing (for testing only)
 * @param password - The plain text password to hash
 * @param salt - The salt to use
 * @returns string - The hashed password
 * @deprecated This should only be used in tests
 */
export function hashPasswordSync(password: string, salt: string): string {
  try {
    return bcrypt.hashSync(password, salt);
  } catch (error) {
    logger.error('Failed to hash password synchronously', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error('Failed to hash password');
  }
}

/**
 * Synchronous password verification (for testing only)
 * @param password - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns boolean - True if password matches, false otherwise
 * @deprecated This should only be used in tests
 */
export function verifyPasswordSync(password: string, hashedPassword: string): boolean {
  try {
    return bcrypt.compareSync(password, hashedPassword);
  } catch (error) {
    logger.error('Failed to verify password synchronously', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error('Failed to verify password');
  }
}