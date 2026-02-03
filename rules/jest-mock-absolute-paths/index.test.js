'use strict';

/**
 * @fileoverview Tests for jest-mock-absolute-paths rule
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
ruleTester.run('jest-mock-absolute-paths', rule, {
  valid: [
    // Valid: Absolute path with jest.mock()
    {
      code: `jest.mock('@factory/utils');`,
      filename: 'src/components/Button.test.ts',
    },
    {
      code: `jest.mock('fs');`,
      filename: 'src/utils/file.test.ts',
    },
    {
      code: `jest.mock('path');`,
      filename: 'src/utils/path.test.ts',
    },
    {
      code: `jest.mock('@testing-library/react');`,
      filename: 'src/components/Form.test.tsx',
    },
    {
      code: `jest.mock('src/utils/logger');`,
      filename: 'src/services/api.test.ts',
    },
    {
      code: `jest.mock('app/components/Button');`,
      filename: 'src/pages/Home.test.tsx',
    },

    // Valid: jest.doMock() with absolute path
    {
      code: `jest.doMock('axios');`,
      filename: 'src/api/client.test.ts',
    },

    // Valid: jest.unmock() with absolute path
    {
      code: `jest.unmock('lodash');`,
      filename: 'src/utils/helpers.test.ts',
    },

    // Valid: jest.dontMock() with absolute path
    {
      code: `jest.dontMock('uuid');`,
      filename: 'src/utils/id.test.ts',
    },

    // Valid: Non-test file (rule doesn't apply)
    {
      code: `jest.mock('./utils');`,
      filename: 'src/components/Button.ts',
    },

    // Valid: Non-jest.mock() call
    {
      code: `myFunction.mock('./something');`,
      filename: 'src/components/Button.test.ts',
    },

    // Valid: Different jest method
    {
      code: `jest.fn('./something');`,
      filename: 'src/components/Button.test.ts',
    },
  ],

  invalid: [
    // Invalid: Relative path with single dot
    {
      code: `jest.mock('./utils');`,
      filename: 'src/components/Button.test.ts',
      errors: [
        {
          messageId: 'relativePathInJestMock',
          data: { path: './utils' },
        },
      ],
    },

    // Invalid: Relative path with double dots
    {
      code: `jest.mock('../services/api');`,
      filename: 'src/components/Button.test.ts',
      errors: [
        {
          messageId: 'relativePathInJestMock',
          data: { path: '../services/api' },
        },
      ],
    },

    // Invalid: Complex relative path
    {
      code: `jest.mock('../../utils/logger');`,
      filename: 'src/components/forms/LoginForm.test.tsx',
      errors: [
        {
          messageId: 'relativePathInJestMock',
          data: { path: '../../utils/logger' },
        },
      ],
    },

    // Invalid: jest.doMock() with relative path
    {
      code: `jest.doMock('./config');`,
      filename: 'src/services/api.test.ts',
      errors: [
        {
          messageId: 'relativePathInJestMock',
          data: { path: './config' },
        },
      ],
    },

    // Invalid: jest.unmock() with relative path
    {
      code: `jest.unmock('../helpers');`,
      filename: 'src/utils/format.test.ts',
      errors: [
        {
          messageId: 'relativePathInJestMock',
          data: { path: '../helpers' },
        },
      ],
    },

    // Invalid: jest.dontMock() with relative path
    {
      code: `jest.dontMock('./constants');`,
      filename: 'src/config/settings.test.ts',
      errors: [
        {
          messageId: 'relativePathInJestMock',
          data: { path: './constants' },
        },
      ],
    },

    // Invalid: Template literal with relative path
    {
      code: `jest.mock(\`./utils/\${moduleName}\`);`,
      filename: 'src/components/Dynamic.test.ts',
      errors: [
        {
          messageId: 'relativePathInJestMock',
          data: { path: './utils/...' },
        },
      ],
    },

    // Invalid: require.resolve() usage
    {
      code: `jest.mock(require.resolve('some-module'));`,
      filename: 'src/utils/module.test.ts',
      errors: [
        {
          messageId: 'requireInJestMock',
        },
      ],
    },

    // Invalid: Multiple jest.mock() calls with relative paths
    {
      code: `
        jest.mock('./utils');
        jest.mock('../services/api');
        jest.mock('@factory/core');
      `,
      filename: 'src/components/Complex.test.ts',
      errors: [
        {
          messageId: 'relativePathInJestMock',
          data: { path: './utils' },
        },
        {
          messageId: 'relativePathInJestMock',
          data: { path: '../services/api' },
        },
      ],
    },

    // Invalid: jest.mock() in __tests__ directory
    {
      code: `jest.mock('../Button');`,
      filename: 'src/components/__tests__/ButtonGroup.test.tsx',
      errors: [
        {
          messageId: 'relativePathInJestMock',
          data: { path: '../Button' },
        },
      ],
    },

    // Invalid: .spec file with relative path
    {
      code: `jest.mock('./helpers');`,
      filename: 'src/utils/format.spec.ts',
      errors: [
        {
          messageId: 'relativePathInJestMock',
          data: { path: './helpers' },
        },
      ],
    },
  ],
});

console.log('✅ jest-mock-absolute-paths tests passed!');
