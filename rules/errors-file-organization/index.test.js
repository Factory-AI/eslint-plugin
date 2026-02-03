/**
 * @fileoverview Tests for errors-file-organization rule
 * @author Factory Infrastructure Team
 */

'use strict';

const rule = require('./index');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('errors-file-organization', rule, {
  valid: [
    // Error classes in errors.ts file
    {
      code: `
        export class CustomError extends Error {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'errors.ts',
    },
    // Error class extending another Error class
    {
      code: `
        class BaseError extends Error {}
        export class CustomError extends BaseError {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'errors.ts',
    },
    // Error class with name containing "Error"
    {
      code: `
        export class ValidationError extends Error {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'errors.ts',
    },
    // Valid imports in errors.ts
    {
      code: `
        import { ErrorCode } from './enums';
        import { ErrorDetails } from './types';
        import { ERROR_MESSAGES } from './constants';
        import { BaseError } from './errors';
        
        export class CustomError extends BaseError {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'errors.ts',
    },
    // External module imports in errors.ts
    {
      code: `
        import { z } from 'zod';
        
        export class ValidationError extends Error {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'errors.ts',
    },
    // Non-exported Error class in non-errors file (should be valid)
    {
      code: `
        class InternalError extends Error {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'utils.ts',
    },
    // Non-Error class in non-errors file
    {
      code: `
        export class RegularClass {
          constructor() {}
        }
      `,
      filename: 'utils.ts',
    },
    // Re-exports in errors.ts
    {
      code: `
        export { BaseError } from './base-errors';
      `,
      filename: 'errors.ts',
    },
    // Type imports in errors.ts
    {
      code: `
        import type { ErrorType } from './types';
        
        export class CustomError extends Error {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'errors.ts',
    },
  ],

  invalid: [
    // Error class in wrong file
    {
      code: `
        export class CustomError extends Error {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'utils.ts',
      errors: [
        {
          messageId: 'errorClassInWrongFile',
        },
      ],
    },
    // Error class with "Error" in name in wrong file
    {
      code: `
        export class ValidationError extends Error {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'validation.ts',
      errors: [
        {
          messageId: 'errorClassInWrongFile',
        },
      ],
    },
    // Class extending CustomError in wrong file
    {
      code: `
        export class SpecificError extends CustomError {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'specific.ts',
      errors: [
        {
          messageId: 'errorClassInWrongFile',
        },
      ],
    },
    // Non-Error class in errors.ts
    {
      code: `
        export class RegularClass {
          constructor() {}
        }
      `,
      filename: 'errors.ts',
      errors: [
        {
          messageId: 'nonErrorInErrorsFile',
        },
      ],
    },
    // Function in errors.ts
    {
      code: `
        export function createError(message: string) {
          return new Error(message);
        }
      `,
      filename: 'errors.ts',
      errors: [
        {
          messageId: 'nonErrorInErrorsFile',
        },
      ],
    },
    // Const declaration in errors.ts
    {
      code: `
        export const ERROR_MESSAGES = {
          INVALID: 'Invalid input'
        };
      `,
      filename: 'errors.ts',
      errors: [
        {
          messageId: 'nonErrorInErrorsFile',
        },
      ],
    },
    // Interface in errors.ts
    {
      code: `
        export interface ErrorDetails {
          code: string;
          message: string;
        }
      `,
      filename: 'errors.ts',
      errors: [
        {
          messageId: 'nonErrorInErrorsFile',
        },
      ],
    },
    // Type alias in errors.ts
    {
      code: `
        export type ErrorCode = 'E001' | 'E002';
      `,
      filename: 'errors.ts',
      errors: [
        {
          messageId: 'nonErrorInErrorsFile',
        },
      ],
    },
    // Enum in errors.ts
    {
      code: `
        export enum ErrorCodes {
          INVALID = 'INVALID',
          NOT_FOUND = 'NOT_FOUND'
        }
      `,
      filename: 'errors.ts',
      errors: [
        {
          messageId: 'nonErrorInErrorsFile',
        },
      ],
    },
    // Invalid import in errors.ts
    {
      code: `
        import { helper } from './utils';
        
        export class CustomError extends Error {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'errors.ts',
      errors: [
        {
          messageId: 'invalidImportInErrorsFile',
        },
      ],
    },
    // Invalid relative import in errors.ts
    {
      code: `
        import { someFunction } from '../helpers';
        
        export class CustomError extends Error {
          constructor(message: string) {
            super(message);
          }
        }
      `,
      filename: 'errors.ts',
      errors: [
        {
          messageId: 'invalidImportInErrorsFile',
        },
      ],
    },
  ],
});
