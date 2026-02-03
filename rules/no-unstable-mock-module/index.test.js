'use strict';

/**
 * @fileoverview Tests for no-unstable-mock-module rule
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
ruleTester.run('no-unstable-mock-module', rule, {
  valid: [
    // Valid: Using jest.mock()
    {
      code: `jest.mock('@factory/utils');`,
    },
    {
      code: `jest.mock('fs');`,
    },
    {
      code: `jest.mock('./local-module');`,
    },
    // Valid: Using other jest methods
    {
      code: `jest.fn();`,
    },
    {
      code: `jest.spyOn(console, 'log');`,
    },
    {
      code: `jest.doMock('axios');`,
    },
    {
      code: `jest.unmock('lodash');`,
    },
    // Valid: Not a jest method
    {
      code: `something.unstable_mockModule('module');`,
    },
    {
      code: `myObject.unstable_mockModule();`,
    },
  ],

  invalid: [
    // Invalid: Using jest.unstable_mockModule()
    {
      code: `jest.unstable_mockModule('fs', () => ({ default: {} }));`,
      errors: [
        {
          messageId: 'noUnstableMockModule',
        },
      ],
    },
    {
      code: `jest.unstable_mockModule('@factory/utils');`,
      errors: [
        {
          messageId: 'noUnstableMockModule',
        },
      ],
    },
    {
      code: `jest.unstable_mockModule('./local-module', () => {
        return {
          default: jest.fn(),
        };
      });`,
      errors: [
        {
          messageId: 'noUnstableMockModule',
        },
      ],
    },
    // Invalid: Multiple calls
    {
      code: `
        jest.unstable_mockModule('module1', () => ({}));
        jest.mock('module2');
        jest.unstable_mockModule('module3', () => ({}));
      `,
      errors: [
        {
          messageId: 'noUnstableMockModule',
        },
        {
          messageId: 'noUnstableMockModule',
        },
      ],
    },
  ],
});
