'use strict';

/**
 * @fileoverview Tests for jest-mock-require-actual rule
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
ruleTester.run('jest-mock-require-actual', rule, {
  valid: [
    // Valid: jest.mock() with jest.requireActual() in arrow function
    {
      code: `jest.mock('@factory/utils/text', () => ({
        ...jest.requireActual('@factory/utils/text'),
        getDiff: jest.fn(),
      }));`,
      filename: 'src/utils/text.test.ts',
    },
    // Valid: jest.mock() with only jest.requireActual()
    {
      code: `jest.mock('path', () => jest.requireActual('path'));`,
      filename: 'src/utils/path.test.ts',
    },
    // Valid: jest.mock() with nested jest.requireActual()
    {
      code: `jest.mock('@testing-library/react', () => {
        const actual = jest.requireActual('@testing-library/react');
        return {
          ...actual,
          render: jest.fn(),
        };
      });`,
      filename: 'src/components/Button.test.tsx',
    },
    // Valid: Not a test file, should be ignored
    {
      code: `jest.mock('fs');`,
      filename: 'src/utils/helpers.ts',
    },
    // Valid: jest.mock() with array containing jest.requireActual()
    {
      code: `jest.mock('utils', () => [
        ...jest.requireActual('utils'),
        jest.fn(),
      ]);`,
      filename: 'src/services/api.test.ts',
    },
  ],

  invalid: [
    // Invalid: jest.mock() with only one argument
    {
      code: `jest.mock('@factory/utils');`,
      filename: 'src/utils/helpers.test.ts',
      errors: [
        {
          messageId: 'missingSecondArgument',
        },
      ],
      output: `jest.mock('@factory/utils', () => ({ ...jest.requireActual('@factory/utils') }));`,
    },
    // Invalid: jest.mock() with second argument but no jest.requireActual()
    {
      code: `jest.mock('fs', () => ({
        readFileSync: jest.fn(),
        writeFileSync: jest.fn(),
      }));`,
      filename: 'src/utils/file.test.ts',
      errors: [
        {
          messageId: 'missingRequireActual',
        },
      ],
    },
    // Invalid: jest.mock() with empty function
    {
      code: `jest.mock('path', () => {});`,
      filename: 'src/utils/path.test.ts',
      errors: [
        {
          messageId: 'missingRequireActual',
        },
      ],
    },
    // Invalid: jest.mock() returning null
    {
      code: `jest.mock('axios', () => null);`,
      filename: 'src/api/client.test.ts',
      errors: [
        {
          messageId: 'missingRequireActual',
        },
      ],
    },
    // Invalid: jest.mock() with wrong method name (requireMock instead of requireActual)
    {
      code: `jest.mock('next/router', () => ({
        ...jest.requireMock('next/router'),
        push: jest.fn(),
      }));`,
      filename: 'src/pages/Home.test.tsx',
      errors: [
        {
          messageId: 'missingRequireActual',
        },
      ],
    },
    // Invalid: jest.mock() that only spreads jest.requireActual() with arrow function
    {
      code: `jest.mock('@/utils/fetch', () => ({
        ...jest.requireActual('@/utils/fetch'),
      }));`,
      filename: 'src/utils/fetch.test.ts',
      errors: [
        {
          messageId: 'pointlessRequireActualOnly',
        },
      ],
      output: ``,
    },
    // Invalid: jest.mock() that only spreads jest.requireActual() with function expression
    {
      code: `jest.mock('@/utils/api', function() {
        return {
          ...jest.requireActual('@/utils/api'),
        };
      });`,
      filename: 'src/utils/api.test.ts',
      errors: [
        {
          messageId: 'pointlessRequireActualOnly',
        },
      ],
      output: ``,
    },
    // Invalid: jest.mock() that only spreads jest.requireActual() with arrow function and block
    {
      code: `jest.mock('@/components/Button', () => {
        return {
          ...jest.requireActual('@/components/Button'),
        };
      });`,
      filename: 'src/components/Button.test.tsx',
      errors: [
        {
          messageId: 'pointlessRequireActualOnly',
        },
      ],
      output: ``,
    },
  ],
});

console.log('✅ jest-mock-require-actual tests passed!');
