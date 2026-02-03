'use strict';

/**
 * @fileoverview Tests for enum-file-organization rule
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
ruleTester.run('enum-file-organization', rule, {
  valid: [
    // Test valid enum in enums.ts file
    {
      code: `
        enum Direction {
          Up = 'UP',
          Down = 'DOWN',
          Left = 'LEFT',
          Right = 'RIGHT'
        }
        
        export enum Visibility {
          Public = 'PUBLIC',
          Private = 'PRIVATE'
        }
      `,
      filename: 'src/enums.ts',
    },

    // Test valid type exports in enums.ts file
    {
      code: `
        enum Status {
          Active = 'ACTIVE',
          Inactive = 'INACTIVE'
        }
        
        export type StatusType = keyof typeof Status;
        
        export interface EnumMap {
          status: StatusType;
        }
      `,
      filename: 'src/features/enums.ts',
    },

    // Test valid re-exports in enums.ts file
    {
      code: `
        enum Role {
          Admin = 'ADMIN',
          User = 'USER',
          Guest = 'GUEST'
        }
        
        export { Role };
        export type RoleType = keyof typeof Role;
      `,
      filename: '/path/to/enums.ts',
    },

    // Test valid export default enum in enums.ts file
    // Test non-enum file (rule shouldn't apply to non-TypeScript files)
    {
      code: `
        const enum Direction {
          Up = 'UP',
          Down = 'DOWN'
        }
      `,
      filename: 'src/utils.js',
    },
    // Non-exported enum in non-enums.ts file
    {
      code: `
        enum UserStatus {
          Active = 'ACTIVE',
          Inactive = 'INACTIVE'
        }
      `,
      filename: 'src/utils.js',
    },
  ],

  invalid: [
    // Test enum in non-enums.ts file
    {
      code: `
        export enum UserStatus {
          Active = 'ACTIVE',
          Inactive = 'INACTIVE'
        }
      `,
      filename: 'src/types.ts',
      errors: [{ messageId: 'enumInWrongFile' }],
    },

    // Test function declaration in enums.ts file
    {
      code: `
        enum Direction {
          Up = 'UP',
          Down = 'DOWN'
        }
        
        function getDirection(dir: string): Direction {
          return Direction[dir];
        }
      `,
      filename: 'src/enums.ts',
      errors: [{ messageId: 'nonEnumInEnumFile' }],
    },

    // Test class declaration in enums.ts file
    {
      code: `
        enum Status {
          Active = 'ACTIVE',
          Inactive = 'INACTIVE'
        }
        
        class StatusManager {
          getStatus() {
            return Status.Active;
          }
        }
      `,
      filename: '/path/to/enums.ts',
      errors: [{ messageId: 'nonEnumInEnumFile' }],
    },

    // Test variable declaration in enums.ts file
    {
      code: `
        enum LogLevel {
          Debug = 0,
          Info = 1,
          Warn = 2,
          Error = 3
        }
        
        const DEFAULT_LEVEL = LogLevel.Info;
      `,
      filename: 'enums.ts',
      errors: [{ messageId: 'nonEnumInEnumFile' }],
    },

    // Test import statement in enums.ts file
    {
      code: `
        import { SomeType } from './types';
        
        enum ImportedEnum {
          One = 1,
          Two = 2
        }
      `,
      filename: 'src/features/enums.ts',
      errors: [{ messageId: 'importsInEnumFile' }],
    },

    // Test multiple errors in enums.ts file
    {
      code: `
        import { SomeType } from './types';
        
        enum Status {
          Active = 'ACTIVE',
          Inactive = 'INACTIVE'
        }
        
        const DEFAULT_STATUS = Status.Active;
        
        function getStatus(): Status {
          return DEFAULT_STATUS;
        }
      `,
      filename: 'enums.ts',
      errors: [
        { messageId: 'importsInEnumFile' },
        { messageId: 'nonEnumInEnumFile' },
        { messageId: 'nonEnumInEnumFile' },
      ],
    },

    // Test export default enum in enums.ts file (now invalid)
    {
      code: `
        enum LogLevel {
          Debug = 0,
          Info = 1,
          Warn = 2,
          Error = 3
        }
        
        export default LogLevel;
      `,
      filename: 'enums.ts',
      errors: [{ messageId: 'nonEnumInEnumFile' }],
    },
  ],
});
