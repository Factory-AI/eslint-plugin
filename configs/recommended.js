'use strict';

const baseConfig = require('./base');

module.exports = {
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), '@factory'],
  rules: {
    ...baseConfig.rules,
    '@factory/no-exported-string-union-types': 'error',
    '@factory/structured-logging': 'error',
    '@factory/enum-file-organization': 'error',
    '@factory/types-file-organization': 'error',
    '@factory/constants-file-organization': 'error',
    '@factory/errors-file-organization': 'error',
    '@factory/no-exported-function-expressions': 'error',
    '@factory/test-utils-organization': 'error',
    '@factory/test-file-location': 'error',
    '@factory/no-unstable-mock-module': 'error',
    '@factory/jest-mock-require-actual': 'error',
    '@factory/no-log-exception-with-throw': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "CallExpression[callee.object.name='jest'][callee.property.name='doMock']",
        message:
          'Prefer using jest.mock() over jest.doMock() to ensure hoisting of mock calls.',
      },
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
      {
        selector: 'ExportAllDeclaration',
        message:
          "Export all doesn't work well if imported in ESM due to how they are transpiled, " +
          'and they can also lead to unexpected exposure of internal methods.',
      },
      {
        selector: 'CatchClause CallExpression[callee.name="logError"]',
        message:
          'Do not use "logError()" inside of a catch block, use logException() instead.',
      },
      {
        selector: 'CatchClause CallExpression[callee.property.name="logError"]',
        message:
          'Do not use "logError()" inside of a catch block, use logException() instead.',
      },
      {
        selector: 'ThrowStatement > NewExpression[callee.name="Error"]',
        message: 'Use MetaError instead of Error.',
      },
    ],
  },
  overrides: [
    ...(baseConfig.overrides || []),
    {
      files: ['index.ts'],
      rules: {
        'no-barrel-files/no-barrel-files': 'off',
      },
    },
    // Test files
    {
      files: ['*.test.{js,ts,tsx,jsx}', '**/test-utils/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'max-classes-per-file': 'off',
        'no-console': 'off',
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['errors.ts'],
      rules: {
        'max-classes-per-file': 'off',
      },
    },
    {
      // Config files have different export/import conventions.
      files: ['./*.config.*'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      // Mocks often mirror originals and may need default exports.
      files: ['**/mocks/*.{js,ts,tsx}'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['schema.ts'],
      rules: {
        '@factory/types-file-organization': 'off',
        '@factory/constants-file-organization': 'off',
      },
    },
    {
      files: [
        'route.ts',
        'api.ts',
        'slice.ts',
        'selectors.ts',
        '*.test.{js,ts,tsx,jsx}',
        '**/test-utils/**',
      ],
      rules: {
        '@factory/constants-file-organization': 'off',
      },
    },
  ],
};
