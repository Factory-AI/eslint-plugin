/**
 * @fileoverview Tests for structured-logging rule
 * @author Factory Infrastructure Team
 */
'use strict';

const { RuleTester } = require('eslint');
const rule = require('./index');

// Set up the ESLint rule tester with the appropriate parser options
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

// Run the tests
ruleTester.run('structured-logging', rule, {
  // Valid code examples - these should NOT trigger the rule
  valid: [
    // Static error messages are allowed
    "throw new Error('Static error message');",
    "throw new MetaError('Static error message');",
    "throw new CustomError('Static error message');",

    // Properly structured MetaError or custom class with metadata
    "throw new MetaError('Failed to fetch data', { userId, requestId });",
    "throw new CustomError('Failed to fetch data', { userId, requestId });",

    // Logging functions with static messages
    "logError('Static error message');",
    "logException(error, 'Static error message');",

    // Logging functions where we don't care about the message format
    'log(`Dynamic warning message ${variable}`);',
    'logger.info(`Dynamic warning message ${variable}`);',
    'console.log(`This is a template ${variable}`);',
    'console.error(`This is a template ${variable}`);',

    // Properly structured logging with metadata
    "logError('Failed to fetch data', { userId, requestId });",
    'logError(`Failed to fetch data`, { userId, requestId });',
    "logException(error, 'Failed to process request', { userId });",
    'logException(error, `Failed to process request`, { userId });',

    // Non-logging functions with template literals (should be ignored)
    'someOtherFunction(`Template ${withVariable}`);',
    'new Something(`Template ${withVariable}`);',
    'setError(`Template ${withVariable}`);',
    'const error = recordError(`Template ${withVariable}`);',
  ],

  // Invalid code examples - these should trigger the rule
  invalid: [
    // Error constructor with template literals
    {
      code: 'throw new Error(`Failed to fetch data for user ${userId}`);',
      errors: [
        {
          message:
            'Use MetaError with structured metadata instead of Error with template literals',
          type: 'NewExpression',
        },
      ],
      output:
        "throw new MetaError('Failed to fetch data for user', { userId });",
    },
    {
      code: 'throw new Error(`Multiple ${var1} and ${var2} in template`);',
      errors: [
        {
          message:
            'Use MetaError with structured metadata instead of Error with template literals',
          type: 'NewExpression',
        },
      ],
      output:
        "throw new MetaError('Multiple  and  in template', { var1, var2 });",
    },

    // Error constructor with string concatenation
    {
      code: "throw new Error('Failed to fetch data for user ' + userId);",
      errors: [
        {
          message:
            'Use MetaError with structured metadata instead of Error with template literals',
          type: 'NewExpression',
        },
      ],
      output:
        "throw new MetaError('Failed to fetch data for user ', { param1: 'Failed to fetch data for user ' + userId });",
    },

    // logError with template literals
    {
      code: 'logError(`Failed to process request ${requestId}`);',
      errors: [
        {
          message:
            'Use structured logging format for logError instead of template literals',
          type: 'CallExpression',
        },
      ],
      output: "logError('Failed to process request', { requestId });",
    },

    // logException with template literals
    {
      code: 'logException(error, `Failed to process request ${requestId}`);',
      errors: [
        {
          message:
            'Use structured logging format for logException instead of template literals',
          type: 'CallExpression',
        },
      ],
      // This should not be fixed automatically because it has more than one argument
      output: 'logException(error, `Failed to process request ${requestId}`);',
    },

    // logError with string concatenation
    {
      code: "logError('Failed to process request ' + requestId);",
      errors: [
        {
          message:
            'Use structured logging format for logError instead of template literals',
          type: 'CallExpression',
        },
      ],
      output:
        "logError('Failed to process request ', { param1: 'Failed to process request ' + requestId });",
    },

    // logWarn with template literals
    {
      code: 'logWarn(`Dynamic warning message ${variable}`);',
      errors: [
        {
          message:
            'Use structured logging format for logWarn instead of template literals',
          type: 'CallExpression',
        },
      ],
      output: "logWarn('Dynamic warning message', { variable });",
    },

    // logInfo with template literals
    {
      code: 'logInfo(`Dynamic warning message ${variable}`);',
      errors: [
        {
          message:
            'Use structured logging format for logInfo instead of template literals',
          type: 'CallExpression',
        },
      ],
      output: "logInfo('Dynamic warning message', { variable });",
    },

    // Complex template with multiple expressions
    {
      code: 'throw new Error(`Error processing ${operation} for user ${userId} in context ${context}`);',
      errors: [
        {
          message:
            'Use MetaError with structured metadata instead of Error with template literals',
          type: 'NewExpression',
        },
      ],
      output:
        "throw new MetaError('Error processing  for user  in context ', { operation, userId, context });",
    },

    // Template with expressions that aren't simple identifiers
    {
      code: 'throw new Error(`Error: ${error.message} (code: ${error.code})`);',
      errors: [
        {
          message:
            'Use MetaError with structured metadata instead of Error with template literals',
          type: 'NewExpression',
        },
      ],
      output:
        "throw new MetaError('Error:  (code: )', { param1: error.message, param2: error.code });",
    },

    // Template with expressions that aren't simple identifiers
    {
      code: 'throw new MetaError(`Error: ${error.message} (code: ${error.code})`);',
      errors: [
        {
          message:
            'Use MetaError with structured metadata instead of MetaError with template literals',
          type: 'NewExpression',
        },
      ],
      output:
        "throw new MetaError('Error:  (code: )', { param1: error.message, param2: error.code });",
    },

    // Some custom error class
    {
      code: 'throw new CustomError(`${X} should be ${Y}`);',
      errors: [
        {
          message:
            'Use MetaError with structured metadata instead of CustomError with template literals',
          type: 'NewExpression',
        },
      ],
      output: null, // No fix available for custom error classes
    },
  ],
});
