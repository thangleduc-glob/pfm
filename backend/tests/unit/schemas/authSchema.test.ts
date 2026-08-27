/**
 * Unit tests for authentication schemas
 */

import {
  loginRequestSchema,
  registerRequestSchema,
  refreshTokenRequestSchema,
  logoutRequestSchema,
  userResponseSchema,
  authResponseSchema,
  tokenValidationResponseSchema,
  accessTokenPayloadSchema,
  refreshTokenPayloadSchema,
  jwtPayloadSchema,
  authErrorResponseSchema,
  jwtConfigSchema,
  passwordConfigSchema,
  validateLoginRequest,
  validateRegisterRequest,
  validateRefreshTokenRequest,
  validateLogoutRequest,
  validateJwtPayload,
  createAuthErrorResponse,
} from '../../../src/schemas/authSchema';

describe('Authentication Schemas', () => {
  describe('Request Schemas', () => {
    describe('loginRequestSchema', () => {
      it('should validate valid login request', () => {
        const validData = {
          username: 'testuser',
          password: 'password123',
        };

        const result = loginRequestSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject empty username', () => {
        const invalidData = {
          username: '',
          password: 'password123',
        };

        expect(() => loginRequestSchema.parse(invalidData)).toThrow();
      });

      it('should reject empty password', () => {
        const invalidData = {
          username: 'testuser',
          password: '',
        };

        expect(() => loginRequestSchema.parse(invalidData)).toThrow();
      });
    });

    describe('registerRequestSchema', () => {
      it('should validate valid registration request', () => {
        const validData = {
          username: 'testuser',
          password: 'Password123',
        };

        const result = registerRequestSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject short password', () => {
        const invalidData = {
          username: 'testuser',
          password: '123',
        };

        expect(() => registerRequestSchema.parse(invalidData)).toThrow();
      });

      it('should reject password without letters', () => {
        const invalidData = {
          username: 'testuser',
          password: '12345678',
        };

        expect(() => registerRequestSchema.parse(invalidData)).toThrow();
      });

      it('should reject password without numbers', () => {
        const invalidData = {
          username: 'testuser',
          password: 'Password',
        };

        expect(() => registerRequestSchema.parse(invalidData)).toThrow();
      });
    });

    describe('refreshTokenRequestSchema', () => {
      it('should validate valid refresh token request', () => {
        const validData = {
          refreshToken: 'valid-refresh-token',
        };

        const result = refreshTokenRequestSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject empty refresh token', () => {
        const invalidData = {
          refreshToken: '',
        };

        expect(() => refreshTokenRequestSchema.parse(invalidData)).toThrow();
      });
    });

    describe('logoutRequestSchema', () => {
      it('should validate valid logout request', () => {
        const validData = {
          userId: 'user-123',
        };

        const result = logoutRequestSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject empty user ID', () => {
        const invalidData = {
          userId: '',
        };

        expect(() => logoutRequestSchema.parse(invalidData)).toThrow();
      });
    });
  });

  describe('Response Schemas', () => {
    describe('userResponseSchema', () => {
      it('should validate valid user response', () => {
        const validData = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          username: 'testuser',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = userResponseSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject invalid UUID', () => {
        const invalidData = {
          id: 'invalid-uuid',
          username: 'testuser',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(() => userResponseSchema.parse(invalidData)).toThrow();
      });
    });

    describe('authResponseSchema', () => {
      it('should validate valid auth response', () => {
        const validData = {
          user: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            username: 'testuser',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        };

        const result = authResponseSchema.parse(validData);
        expect(result).toEqual(validData);
      });
    });

    describe('tokenValidationResponseSchema', () => {
      it('should validate valid token validation response', () => {
        const validData = {
          valid: true,
          userId: 'user-123',
          username: 'testuser',
        };

        const result = tokenValidationResponseSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should validate invalid token response', () => {
        const validData = {
          valid: false,
          error: 'Token expired',
        };

        const result = tokenValidationResponseSchema.parse(validData);
        expect(result).toEqual(validData);
      });
    });
  });

  describe('JWT Payload Schemas', () => {
    describe('accessTokenPayloadSchema', () => {
      it('should validate valid access token payload', () => {
        const validData = {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          username: 'testuser',
          type: 'access' as const,
          iat: 1234567890,
          exp: 1234567890,
        };

        const result = accessTokenPayloadSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject wrong token type', () => {
        const invalidData = {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          username: 'testuser',
          type: 'refresh' as const,
          iat: 1234567890,
          exp: 1234567890,
        };

        expect(() => accessTokenPayloadSchema.parse(invalidData)).toThrow();
      });
    });

    describe('refreshTokenPayloadSchema', () => {
      it('should validate valid refresh token payload', () => {
        const validData = {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          username: 'testuser',
          type: 'refresh' as const,
          iat: 1234567890,
          exp: 1234567890,
        };

        const result = refreshTokenPayloadSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject wrong token type', () => {
        const invalidData = {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          username: 'testuser',
          type: 'access' as const,
          iat: 1234567890,
          exp: 1234567890,
        };

        expect(() => refreshTokenPayloadSchema.parse(invalidData)).toThrow();
      });
    });

    describe('jwtPayloadSchema', () => {
      it('should validate access token payload', () => {
        const validData = {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          username: 'testuser',
          type: 'access' as const,
          iat: 1234567890,
          exp: 1234567890,
        };

        const result = jwtPayloadSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should validate refresh token payload', () => {
        const validData = {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          username: 'testuser',
          type: 'refresh' as const,
          iat: 1234567890,
          exp: 1234567890,
        };

        const result = jwtPayloadSchema.parse(validData);
        expect(result).toEqual(validData);
      });
    });
  });

  describe('Error Response Schema', () => {
    describe('authErrorResponseSchema', () => {
      it('should validate valid error response', () => {
        const validData = {
          error: 'Authentication Error',
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS' as const,
        };

        const result = authErrorResponseSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject invalid error code', () => {
        const invalidData = {
          error: 'Authentication Error',
          message: 'Invalid credentials',
          code: 'INVALID_CODE' as const,
        };

        expect(() => authErrorResponseSchema.parse(invalidData)).toThrow();
      });
    });
  });

  describe('Configuration Schemas', () => {
    describe('jwtConfigSchema', () => {
      it('should validate valid JWT config', () => {
        const validData = {
          secret: 'this-is-a-very-long-secret-key-that-is-at-least-32-characters',
          accessTokenExpiresIn: '15m',
          refreshTokenExpiresIn: '7d',
        };

        const result = jwtConfigSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject short secret', () => {
        const invalidData = {
          secret: 'short',
          accessTokenExpiresIn: '15m',
          refreshTokenExpiresIn: '7d',
        };

        expect(() => jwtConfigSchema.parse(invalidData)).toThrow();
      });
    });

    describe('passwordConfigSchema', () => {
      it('should validate valid password config', () => {
        const validData = {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          maxAttempts: 5,
          lockoutDuration: 300000,
        };

        const result = passwordConfigSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should reject min length less than 8', () => {
        const invalidData = {
          minLength: 6,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          maxAttempts: 5,
          lockoutDuration: 300000,
        };

        expect(() => passwordConfigSchema.parse(invalidData)).toThrow();
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateLoginRequest', () => {
      it('should validate and return login request', () => {
        const validData = {
          username: 'testuser',
          password: 'password123',
        };

        const result = validateLoginRequest(validData);
        expect(result).toEqual(validData);
      });

      it('should throw on invalid data', () => {
        const invalidData = {
          username: '',
          password: '',
        };

        expect(() => validateLoginRequest(invalidData)).toThrow();
      });
    });

    describe('validateRegisterRequest', () => {
      it('should validate and return registration request', () => {
        const validData = {
          username: 'testuser',
          password: 'Password123',
        };

        const result = validateRegisterRequest(validData);
        expect(result).toEqual(validData);
      });

      it('should throw on invalid data', () => {
        const invalidData = {
          username: 'testuser',
          password: '123',
        };

        expect(() => validateRegisterRequest(invalidData)).toThrow();
      });
    });

    describe('validateRefreshTokenRequest', () => {
      it('should validate and return refresh token request', () => {
        const validData = {
          refreshToken: 'valid-token',
        };

        const result = validateRefreshTokenRequest(validData);
        expect(result).toEqual(validData);
      });

      it('should throw on invalid data', () => {
        const invalidData = {
          refreshToken: '',
        };

        expect(() => validateRefreshTokenRequest(invalidData)).toThrow();
      });
    });

    describe('validateLogoutRequest', () => {
      it('should validate and return logout request', () => {
        const validData = {
          userId: 'user-123',
        };

        const result = validateLogoutRequest(validData);
        expect(result).toEqual(validData);
      });

      it('should throw on invalid data', () => {
        const invalidData = {
          userId: '',
        };

        expect(() => validateLogoutRequest(invalidData)).toThrow();
      });
    });

    describe('validateJwtPayload', () => {
      it('should validate and return JWT payload', () => {
        const validData = {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          username: 'testuser',
          type: 'access' as const,
          iat: 1234567890,
          exp: 1234567890,
        };

        const result = validateJwtPayload(validData);
        expect(result).toEqual(validData);
      });

      it('should throw on invalid data', () => {
        const invalidData = {
          userId: 'invalid-uuid',
          username: 'testuser',
          type: 'access' as const,
          iat: 1234567890,
          exp: 1234567890,
        };

        expect(() => validateJwtPayload(invalidData)).toThrow();
      });
    });
  });

  describe('Helper Functions', () => {
    describe('createAuthErrorResponse', () => {
      it('should create valid error response', () => {
        const result = createAuthErrorResponse('Invalid credentials', 'INVALID_CREDENTIALS');

        expect(result).toEqual({
          error: 'Authentication Error',
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
      });
    });
  });
});