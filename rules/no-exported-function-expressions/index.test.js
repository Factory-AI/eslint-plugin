/**
 * @fileoverview Tests for no-exported-function-expressions rule
 * @author Factory Infrastructure Team
 */
'use strict';

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
ruleTester.run('no-exported-function-expressions', rule, {
  // Valid code examples - these should NOT trigger the rule
  valid: [
    // Function declaration exports are allowed
    {
      code: 'export function foo() { return 1; }',
      name: 'allows function declaration exports',
    },

    // Named exports of function declarations are allowed
    {
      code: 'function foo() { return 1; } export { foo };',
      name: 'allows named exports of function declarations',
    },

    // Function expressions that aren't exported are allowed
    {
      code: 'const foo = () => 1;',
      name: 'allows function expressions that are not exported',
    },

    // Named exports of function expressions are allowed
    {
      code: 'const foo = function() { return 1; }; export { foo };',
      name: 'allows named exports of function expressions',
    },
  ],

  // Invalid code examples - these should trigger the rule
  invalid: [
    // Arrow function expressions directly exported are not allowed
    {
      code: 'export const foo = () => 1;',
      errors: [
        {
          messageId: 'useFunctionDeclaration',
        },
      ],
      name: 'rejects exported arrow function expressions',
    },

    // Async arrow function expressions directly exported are not allowed
    {
      code: 'export const foo = async () => { return 1; };',
      errors: [
        {
          messageId: 'useFunctionDeclaration',
        },
      ],
      name: 'rejects exported async arrow function expressions',
    },

    // Function expressions directly exported are not allowed
    {
      code: 'export const foo = function() { return 1; };',
      errors: [
        {
          messageId: 'useFunctionDeclaration',
        },
      ],
      name: 'rejects exported function expressions',
    },

    // Default exports of arrow functions are not allowed
    {
      code: 'export default () => 1;',
      errors: [
        {
          messageId: 'useFunctionDeclaration',
        },
      ],
      name: 'rejects default exports of arrow functions',
    },
  ],
});
