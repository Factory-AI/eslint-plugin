'use strict';

/**
 * @fileoverview Tests for test-file-location rule
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
ruleTester.run('test-file-location', rule, {
  valid: [
    // Properly named and colocated test file with describe/it
    {
      code: `
        describe('module', () => { 
          it('works', () => {}); 
        });
      `,
      filename: 'src/module/foo.test.ts',
    },

    // .test.tsx variant with test() call
    {
      code: `
        test('runs', () => {});
      `,
      filename: 'src/module/foo.test.tsx',
    },

    // Files with dots in names (e.g., component.provider.test.tsx)
    {
      code: `
        describe('Sentry provider', () => { 
          it('works', () => {}); 
        });
      `,
      filename: 'src/errors/Sentry.provider.test.tsx',
    },

    // Non-test TypeScript file (should be ignored by rule)
    {
      code: `
        const add = (a: number, b: number) => a + b; 
        export { add };
      `,
      filename: 'src/module/foo.ts',
    },

    // .spec.ts files are not considered test files by this rule (ignored)
    {
      code: `
        describe('spec', () => { 
          it('should be ignored', () => {}); 
        });
      `,
      filename: 'src/module/foo.spec.ts',
    },

    // .spec.tsx files are not considered test files by this rule (ignored)
    {
      code: `
        test('spec tsx', () => {});
      `,
      filename: 'src/module/foo.spec.tsx',
    },

    // Test with beforeEach/afterEach/beforeAll/afterAll
    {
      code: `
        beforeEach(() => {
          // Setup test environment
        });
        
        afterEach(() => {
          // Cleanup test environment
        });
        
        test('something', () => {
          expect(true).toBe(true);
        });
      `,
      filename: 'src/module/setup.test.ts',
    },

    // Test with expect assertions
    {
      code: `
        const result = someFunction();
        expect(result).toBe(true);
      `,
      filename: 'src/module/assertions.test.ts',
    },
  ],

  invalid: [
    // Test helpers in utils directories (missing tests not allowed in current implementation)
    {
      code: `
        const makeHelper = () => ({ ok: true }); 
        export { makeHelper };
      `,
      filename: 'src/module/utils/helpers/helpers.test.ts',
      errors: [{ messageId: 'testFileMissingTests' }],
    },

    // Test helpers in _utils directories (missing tests not allowed in current implementation)
    {
      code: `
        const createTestFixture = () => ({ data: 'test' }); 
        export { createTestFixture };
      `,
      filename: 'src/module/_utils/fixtures/fixtures.test.ts',
      errors: [{ messageId: 'testFileMissingTests' }],
    },
    // Wrong location (under /test/ directory) with valid naming and tests
    {
      code: `
        describe('x', () => { 
          it('y', () => {}); 
        });
      `,
      filename: 'src/test/unit/foo.test.ts',
      errors: [{ messageId: 'testFileInWrongLocation' }],
    },

    // Missing tests in a test file not in utils directories
    {
      code: `
        const value = 42; 
        export default value;
      `,
      filename: 'src/module/noTests.test.ts',
      errors: [{ messageId: 'testFileMissingTests' }],
    },

    // Missing tests
    {
      code: `
        const noTestsHere = true;
      `,
      filename: 'src/module/wrong.naming.test.ts',
      errors: [{ messageId: 'testFileMissingTests' }],
    },

    // Test file in wrong location and missing tests
    {
      code: `
        export const helpers = {};
      `,
      filename: 'src/test/misc/helpers.test.ts',
      errors: [
        { messageId: 'testFileInWrongLocation' },
        { messageId: 'testFileMissingTests' },
      ],
    },

    // Test file in __tests__ folder should not be allowed
    {
      code: `
        describe('test', () => { 
          it('in __tests__ folder', () => {}); 
        });
      `,
      filename: 'src/module/__tests__/foo.test.ts',
      errors: [{ messageId: 'testFileInWrongLocation' }],
    },
  ],
});
