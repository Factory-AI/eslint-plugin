'use strict';

/**
 * @fileoverview Tests for types-file-organization rule
 * @author Factory Infrastructure Team
 */

const { RuleTester } = require('eslint');
const rule = require('./index');

// Configure RuleTester for TypeScript
const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

// Run the tests
ruleTester.run('types-file-organization', rule, {
  valid: [
    // Test valid type alias in types.ts file
    {
      code: `
        export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
        
        export interface User {
          id: string;
          name: string;
          email: string;
        }
      `,
      filename: 'src/types.ts',
    },

    // Test valid imports from enum files in types.ts
    {
      code: `
        import { Status } from './enums';
        
        export type StatusType = Status;
        
        export interface StatusContainer {
          status: Status;
        }
      `,
      filename: 'src/types.ts',
    },

    // Test valid export statements that re-export types
    {
      code: `
        export type ID = string;
        
        export interface BaseEntity {
          id: ID;
          createdAt: Date;
          updatedAt: Date;
        }
        
        export { BaseEntity as Entity };
      `,
      filename: 'src/types.ts',
    },

    // Test non-type files that don't contain exported types/interfaces (should be valid)
    {
      code: `
        import { User } from './types';
        
        function createUser(name: string, email: string): User {
          return {
            id: Math.random().toString(),
            name,
            email
          };
        }
        
        // Private non-exported type is allowed in non-types.ts files
        type PrivateType = string;
        
        // Private non-exported interface is allowed in non-types.ts files
        interface PrivateInterface {
          prop: string;
        }
        
        export { createUser };
      `,
      filename: 'src/users.ts',
    },

    // Test multiple imports from enum files
    {
      code: `
        import { Status } from './enums';
        import { Direction } from '../constants/enums';
        
        export type CombinedType = Status | Direction;
      `,
      filename: 'src/types.ts',
    },

    // Test type aliases with complex type expressions
    {
      code: `
        export type Primitive = string | number | boolean | null | undefined;
        
        export type DeepPartial<T> = T extends object 
          ? { [P in keyof T]?: DeepPartial<T[P]> } 
          : T;
          
        export interface GenericContainer<T> {
          value: T;
          metadata?: Record<string, unknown>;
        }
      `,
      filename: 'src/types.ts',
    },

    // -------------------------------------------------------------
    // New valid cases — external module imports are now permitted
    // -------------------------------------------------------------

    // 1) Importing an external npm module in types.ts
    {
      code: `
        import _ from 'lodash';

        export type AnyObject = Record<string, unknown>;
      `,
      filename: 'src/types.ts',
    },

    // 2) Importing both an external module AND an internal enum file
    {
      code: `
        import React from 'react';
        import { Status } from './enums';

        export interface ComponentStatusProps {
          status: Status;
          children: React.ReactNode;
        }
      `,
      filename: 'src/types.ts',
    },

    // 3) Mixing multiple external imports with enum imports
    {
      code: `
        import 'reflect-metadata';
        import { Direction } from '../constants/enums';

        export type MaybeDirection = Direction | null;
      `,
      filename: 'src/types.ts',
    },
  ],

  invalid: [
    // Test exported type alias in non-types.ts file
    {
      code: `
        export type UserRole = 'admin' | 'user' | 'guest';
      `,
      filename: 'src/constants.ts',
      errors: [
        {
          messageId: 'typeInWrongFile',
        },
      ],
    },

    // Test exported interface in non-types.ts file
    {
      code: `
        export interface Product {
          id: string;
          name: string;
          price: number;
        }
      `,
      filename: 'src/products.ts',
      errors: [
        {
          messageId: 'typeInWrongFile',
        },
      ],
    },

    // Test non-type declaration in types.ts file
    {
      code: `
        export type ValidType = string;
        
        export const INVALID_CONST = 'This should not be in types.ts';
      `,
      filename: 'src/types.ts',
      errors: [
        {
          messageId: 'nonTypeInTypeFile',
        },
      ],
    },

    // Test function declaration in types.ts file
    {
      code: `
        export interface User {
          id: string;
          name: string;
        }
        
        export function createUser(name: string): User {
          return { id: '1', name };
        }
      `,
      filename: 'src/types.ts',
      errors: [
        {
          messageId: 'nonTypeInTypeFile',
        },
      ],
    },

    // Test invalid import (non-enum import) in types.ts
    {
      code: `
        import { someFunction } from './utils';
        
        export type Result = ReturnType<typeof someFunction>;
      `,
      filename: 'src/types.ts',
      errors: [
        {
          messageId: 'invalidImportInTypeFile',
        },
      ],
    },

    // Test class declaration in types.ts
    {
      code: `
        export interface UserInterface {
          id: string;
          name: string;
        }
        
        export class User implements UserInterface {
          id: string;
          name: string;
          
          constructor(name: string) {
            this.id = Math.random().toString();
            this.name = name;
          }
        }
      `,
      filename: 'src/types.ts',
      errors: [
        {
          messageId: 'nonTypeInTypeFile',
        },
      ],
    },

    // Test multiple invalid imports in types.ts
    {
      code: `
        import { Status } from './enums'; // Valid
        import { formatDate } from './utils'; // Invalid
        import { User } from './models'; // Invalid
        
        export type FormattedUser = {
          user: User;
          formattedDate: ReturnType<typeof formatDate>;
          status: Status;
        };
      `,
      filename: 'src/types.ts',
      errors: [
        {
          messageId: 'invalidImportInTypeFile',
        },
        {
          messageId: 'invalidImportInTypeFile',
        },
      ],
    },

    // Test namespace with exported types in non-types.ts file
    {
      code: `
        export namespace API {
          export type Response<T> = {
            data: T;
            status: number;
          };
          
          export interface Error {
            message: string;
            code: number;
          }
        }
      `,
      filename: 'src/api.ts',
      errors: [
        {
          messageId: 'typeInWrongFile',
        },
        {
          messageId: 'typeInWrongFile',
        },
      ],
    },
  ],
});
