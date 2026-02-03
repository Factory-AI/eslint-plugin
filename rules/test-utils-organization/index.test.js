'use strict';

/**
 * @fileoverview Tests for test-utils-organization rule
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
ruleTester.run('test-utils-organization', rule, {
  valid: [
    // Test utilities in test-utils directory with correct naming
    {
      code: `
        import { SomeInterface } from '../interfaces';
        
        export const mockUser = {
          id: 'test-id',
          name: 'Test User',
          email: 'test@example.com'
        };
        
        export function createMockSession(overrides = {}) {
          return {
            id: 'test-session',
            title: 'Test Session',
            ...overrides
          };
        }
      `,
      filename: 'src/session/test-utils/mocks.ts',
    },

    // Test utilities in test-utils/mocks subdirectory
    {
      code: `
        import { SessionStatus } from '../../enums';
        import type { Session } from '../../interfaces';
        
        export function createMockSession(overrides: Partial<Session> = {}): Session {
          return {
            id: 'test-session',
            status: SessionStatus.Active,
            ...overrides
          };
        }
      `,
      filename: 'src/session/test-utils/mocks/session.ts',
    },

    // Type-only imports in test-utils files
    {
      code: `
        import type { User } from '../interfaces';
        import { UserStatus } from '../enums';
        
        export const mockUser: User = {
          id: 'test-id',
          status: UserStatus.Active,
          name: 'Test User'
        };
      `,
      filename: 'src/user/test-utils/mocks.ts',
    },

    // Properly named mock functions in test-utils
    {
      code: `
        import type { Repository } from '../interfaces';
        
        export function mockRepository(overrides = {}): Repository {
          return {
            id: 'repo-id',
            name: 'Test Repo',
            ...overrides
          };
        }
        
        export function createMockPullRequest() {
          return {
            id: 'pr-id',
            title: 'Test PR'
          };
        }
        
        export const testData = {
          defaultRepo: mockRepository(),
          customRepo: mockRepository({ name: 'Custom' })
        };
      `,
      filename: 'src/repositories/test-utils/mocks.ts',
    },

    // Files outside test-utils that don't contain mock utilities
    {
      code: `
        import { User } from './interfaces';
        
        export function getUserById(id: string): Promise<User> {
          // Business logic
          return fetch(\`/api/users/\${id}\`).then(res => res.json());
        }
      `,
      filename: 'src/user/handlers.ts',
    },

    // Regular test file (not in test-utils)
    {
      code: `
        import { getUserById } from './handlers';
        import { mockUser } from './test-utils/mocks';
        
        describe('getUserById', () => {
          it('should fetch user data', async () => {
            // Test code
          });
        });
      `,
      filename: 'src/user/handlers.test.ts',
    },
  ],

  invalid: [
    // Test utilities outside of test-utils directory
    {
      code: `
        export function mockUser() {
          return {
            id: 'test-id',
            name: 'Test User'
          };
        }
      `,
      filename: 'src/user/utils.ts',
      errors: [{ messageId: 'testUtilsInWrongLocation' }],
    },

    // Incorrectly named mock functions
    {
      code: `
        import type { Session } from '../interfaces';
        
        export function mocksession(overrides = {}): Session {
          return {
            id: 'test-session',
            ...overrides
          };
        }
      `,
      filename: 'src/session/test-utils/mocks.ts',
      errors: [{ messageId: 'incorrectMockNaming' }],
    },
  ],
});
