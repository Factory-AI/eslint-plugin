/**
 * @fileoverview Tests for no-log-exception-with-throw rule
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
ruleTester.run('no-log-exception-with-throw', rule, {
  // Valid code examples - these should NOT trigger the rule
  valid: [
    // logException and throw in different blocks - this is allowed
    `
    function test() {
      if (foo) {
        throw new Error('foo');
      }
      logException(error, 'Something went wrong');
      return;
    }
    `,

    // Only logException, no throw in same block
    `
    function test() {
      logException(error, 'Something went wrong');
      return;
    }
    `,

    // Only throw, no logException in same block
    `
    function test() {
      throw new Error('Something went wrong');
    }
    `,

    // logException and throw in completely different functions
    `
    function test1() {
      logException(error, 'Something went wrong');
    }
    function test2() {
      throw new Error('Something went wrong');
    }
    `,

    // logException in parent block, throw in nested block - this is allowed
    `
    function test() {
      logException(error, 'Something went wrong');
      if (condition) {
        throw new Error('Something went wrong');
      }
    }
    `,

    // Different nesting levels - throw in parent, logException in nested
    `
    function test() {
      throw new Error('Something went wrong');
      try {
        logException(error, 'Something went wrong');
      } catch (e) {
        // handle error
      }
    }
    `,

    // logException in try, throw in catch - different blocks
    `
    try {
      logException(error, 'Something went wrong');
      doSomething();
    } catch (e) {
      throw new Error('Something went wrong');
    }
    `,

    // Multiple blocks with safe usage
    `
    function test() {
      if (conditionA) {
        logException(error, 'Something went wrong');
        return;
      }
      
      if (conditionB) {
        throw new Error('Something went wrong');
      }
    }
    `,

    // logError and throw in different blocks - this is allowed (same behavior as logException)
    `
    function test() {
      if (foo) {
        throw new Error('foo');
      }
      logError('Something went wrong');
      return;
    }
    `,

    // logException as part of larger expression in different block
    `
    function test() {
      if (error) {
        logException(error, 'Processing failed');
      }
      
      if (shouldThrow) {
        throw new Error('Critical error');
      }
    }
    `,
  ],

  // Invalid code examples - these should trigger the rule
  invalid: [
    // logError in same block as throw
    {
      code: `
        function test() {
          logError('Something went wrong');
          foo();
          throw new Error('foo');
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },
    // Simple case - logException and throw in same function block
    {
      code: `
        function test() {
          logException(error, 'Something went wrong');
          foo();
          throw new Error('foo');
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // Both statements at the top level of a program
    {
      code: `
        logException(error, 'Something went wrong');
        foo();
        throw new Error('foo');
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // Same block with throw first, then logException
    {
      code: `
        function test() {
          throw new Error('foo');
          logException(error, 'Something went wrong');
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // Both in if block
    {
      code: `
        if (condition) {
          logException(error, 'Something went wrong');
          throw new Error('foo');
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // Both in try block
    {
      code: `
        try {
          logException(error, 'Something went wrong');
          doSomething();
          throw new Error('foo');
        } catch (e) {
          // handle
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // Both in catch block
    {
      code: `
        try {
          doSomething();
        } catch (e) {
          logException(e, 'Caught error');
          throw new Error('Rethrowing');
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // Multiple logException calls in same block as throw
    {
      code: `
        function test() {
          logException(error1, 'First error');
          logException(error2, 'Second error');
          throw new Error('foo');
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // Multiple throw statements in same block as logException
    {
      code: `
        function test() {
          logException(error, 'Something went wrong');
          if (a) throw new Error('A');
          if (b) throw new Error('B');
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // Nested function with violation
    {
      code: `
        function outer() {
          function inner() {
            logException(error, 'Inner error');
            throw new Error('Inner throw');
          }
          inner();
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // Arrow function with violation
    {
      code: `
        const handler = () => {
          logException(error, 'Handler error');
          throw new Error('Handler error');
        };
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // For loop block with violation
    {
      code: `
        for (let i = 0; i < 10; i++) {
          logException(error, 'Loop error');
          throw new Error('Loop error');
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // While loop block with violation
    {
      code: `
        while (condition) {
          logException(error, 'While error');
          throw new Error('While error');
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },

    // Switch case block with violation
    {
      code: `
        switch (value) {
          case 'error':
            logException(error, 'Switch error');
            throw new Error('Switch error');
            break;
        }
      `,
      errors: [
        {
          messageId: 'noLogExceptionWithThrow',
          type: 'CallExpression',
        },
      ],
    },
  ],
});
