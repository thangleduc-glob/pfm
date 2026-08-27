/**
 * Validation middleware
 * Provides Zod schema validation for Express requests
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { createAuthErrorResponse } from '../schemas/authSchema';

/**
 * Validation error details
 */
interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

/**
 * Validation error response
 */
interface ValidationErrorResponse {
  error: string;
  code: string;
  timestamp: string;
  path: string;
  method: string;
  details: ValidationErrorDetail[];
}

/**
 * Create a validation middleware function
 * @param schema - Zod schema to validate against
 * @param target - What to validate ('body', 'query', 'params', or 'all')
 * @returns Express middleware function
 */
export function validateRequest(
  schema: z.ZodSchema,
  target: 'body' | 'query' | 'params' | 'all' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      let dataToValidate: any;

      // Select the data to validate based on target
      switch (target) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        case 'all':
          dataToValidate = {
            body: req.body,
            query: req.query,
            params: req.params,
          };
          break;
        default:
          dataToValidate = req.body;
      }

      // Validate the data
      const validatedData = schema.parse(dataToValidate);

      // Replace the original data with validated data
      switch (target) {
        case 'body':
          req.body = validatedData;
          break;
        case 'query':
          req.query = validatedData;
          break;
        case 'params':
          req.params = validatedData;
          break;
        case 'all':
          req.body = validatedData.body;
          req.query = validatedData.query;
          req.params = validatedData.params;
          break;
      }

      // Continue to next middleware
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format validation errors
        const details: ValidationErrorDetail[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Request validation failed', {
          path: req.path,
          method: req.method,
          details,
          ip: req.ip,
        });

        const errorResponse: ValidationErrorResponse = {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method,
          details,
        };

        res.status(400).json(errorResponse);
        return;
      }

      // Handle unexpected errors
      logger.error('Validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      res.status(500).json(
        createAuthErrorResponse('Validation failed', 'INTERNAL_ERROR')
      );
    }
  };
}

/**
 * Validate request body using Zod schema
 * @param schema - Zod schema for request body
 * @returns Express middleware function
 */
export const validateBody = (schema: z.ZodSchema) => 
  validateRequest(schema, 'body');

/**
 * Validate request query parameters using Zod schema
 * @param schema - Zod schema for query parameters
 * @returns Express middleware function
 */
export const validateQuery = (schema: z.ZodSchema) => 
  validateRequest(schema, 'query');

/**
 * Validate request parameters using Zod schema
 * @param schema - Zod schema for URL parameters
 * @returns Express middleware function
 */
export const validateParams = (schema: z.ZodSchema) => 
  validateRequest(schema, 'params');

/**
 * Validate multiple parts of the request
 * @param schemas - Object containing schemas for different parts
 * @returns Express middleware function
 */
export function validateMultiple(schemas: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate each part if schema is provided
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details: ValidationErrorDetail[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Request validation failed', {
          path: req.path,
          method: req.method,
          details,
          ip: req.ip,
        });

        const errorResponse: ValidationErrorResponse = {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method,
          details,
        };

        res.status(400).json(errorResponse);
        return;
      }

      logger.error('Validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      res.status(500).json(
        createAuthErrorResponse('Validation failed', 'INTERNAL_ERROR')
      );
    }
  };
}

/**
 * Custom validation middleware for specific business rules
 * @param validator - Custom validation function
 * @param errorMessage - Error message to return if validation fails
 * @returns Express middleware function
 */
export function customValidation(
  validator: (req: Request) => boolean | string,
  errorMessage: string = 'Custom validation failed'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = validator(req);
      
      if (result === true) {
        // Validation passed
        next();
        return;
      }

      // Validation failed
      const message = typeof result === 'string' ? result : errorMessage;
      
      logger.warn('Custom validation failed', {
        path: req.path,
        method: req.method,
        message,
        ip: req.ip,
      });

      res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        details: [{
          field: 'custom',
          message,
        }],
      });
    } catch (error) {
      logger.error('Custom validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      res.status(500).json(
        createAuthErrorResponse('Validation failed', 'INTERNAL_ERROR')
      );
    }
  };
}