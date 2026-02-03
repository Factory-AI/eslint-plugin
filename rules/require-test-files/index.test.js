'use strict';

/**
 * @fileoverview Tests for require-test-files rule
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
ruleTester.run('require-test-files', rule, {
  valid: [
    // Exempt files don't require tests
    {
      code: 'export enum Status { ACTIVE, INACTIVE }',
      filename: '/project/src/enums.ts',
    },
    {
      code: 'export type User = { id: string; name: string; }',
      filename: '/project/src/types.ts',
    },
    {
      code: 'export const API_URL = "https://api.example.com";',
      filename: '/project/src/constants.ts',
    },
    {
      code: 'export class CustomError extends Error {}',
      filename: '/project/src/errors.ts',
    },
    {
      code: 'export const schema = {};',
      filename: '/project/src/schema.ts',
    },
    // Test files themselves don't need tests
    {
      code: 'describe("test", () => { it("works", () => {}); });',
      filename: '/project/src/utils/helper.test.ts',
    },
    // Index files don't need tests
    {
      code: 'export * from "./helper";',
      filename: '/project/src/utils/index.ts',
    },
    // Config files don't need tests
    {
      code: 'export default { api: "https://api.example.com" };',
      filename: '/project/src/config.ts',
    },
    // Non-TypeScript files are ignored
    {
      code: 'const foo = "bar";',
      filename: '/project/src/utils/helper.js',
    },
    // TSX files are ignored (components don't require test files)
    {
      code: 'export const Component = () => <div>Hello</div>;',
      filename: '/project/src/components/Button.tsx',
    },
    {
      code: 'export default function Page() { return <div>Page</div>; }',
      filename: '/project/src/pages/HomePage.tsx',
    },
  ],
  invalid: [
    {
      code: 'export const helper = () => "help";',
      filename: '/project/src/utils/utility.ts',
      errors: [
        {
          messageId: 'missingTestFile',
          data: {
            filename: 'utility.ts',
            testFilename: 'utility.test.ts',
          },
        },
      ],
    },
  ],
});
