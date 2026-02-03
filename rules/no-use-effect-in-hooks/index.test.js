/**
 * @fileoverview Tests for no-use-effect-in-hooks rule
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('./index');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
});

ruleTester.run('no-use-effect-in-hooks', rule, {
  valid: [
    // useEffect in a regular component is allowed
    {
      code: `
        import { useEffect } from 'react';
        export function Component() {
          useEffect(() => {
            console.log('mounted');
          }, []);
          return <div />;
        }
      `,
      filename: '/path/to/Component.tsx',
    },
    // useMountEffect in a regular component is allowed
    {
      code: `
        import { useMountEffect } from './hooks';
        export function Component() {
          useMountEffect(() => {
            console.log('mounted');
          });
          return <div />;
        }
      `,
      filename: '/path/to/Component.tsx',
    },
    // useEffect in regular function not starting with "use" is allowed
    {
      code: `
        import { useEffect } from 'react';
        function helper() {
          useEffect(() => {}, []);
        }
      `,
      filename: '/path/to/helper.tsx',
    },
    // Test files are ignored
    {
      code: `
        import { useEffect } from 'react';
        export function useCustomHook() {
          useEffect(() => {}, []);
        }
      `,
      filename: '/path/to/useCustomHook.test.tsx',
    },
    // Custom hooks can use other hooks (just not useEffect/useMountEffect)
    {
      code: `
        import { useState } from 'react';
        export function useCounter() {
          const [count, setCount] = useState(0);
          return { count, setCount };
        }
      `,
      filename: '/path/to/useCounter.tsx',
    },
  ],

  invalid: [
    // useEffect in custom hook (function declaration)
    {
      code: `
        import { useEffect } from 'react';
        export function useCustomHook() {
          useEffect(() => {
            console.log('effect');
          }, []);
        }
      `,
      filename: '/path/to/useCustomHook.tsx',
      errors: [
        {
          messageId: 'noUseEffectInHook',
          data: { hookName: 'useEffect' },
        },
      ],
    },
    // useEffect in custom hook (arrow function)
    {
      code: `
        import { useEffect } from 'react';
        export const useCustomHook = () => {
          useEffect(() => {
            console.log('effect');
          }, []);
        };
      `,
      filename: '/path/to/useCustomHook.tsx',
      errors: [
        {
          messageId: 'noUseEffectInHook',
          data: { hookName: 'useEffect' },
        },
      ],
    },
    // useMountEffect in custom hook
    {
      code: `
        import { useMountEffect } from './hooks';
        export const useTheme = () => {
          useMountEffect(() => {
            console.log('mounted');
          });
        };
      `,
      filename: '/path/to/useTheme.tsx',
      errors: [
        {
          messageId: 'noUseEffectInHook',
          data: { hookName: 'useMountEffect' },
        },
      ],
    },
    // useLayoutEffect in custom hook (function declaration)
    {
      code: `
        import { useLayoutEffect } from 'react';
        export function useCustomHook() {
          useLayoutEffect(() => {
            console.log('layout effect');
          }, []);
        }
      `,
      filename: '/path/to/useCustomHook.tsx',
      errors: [
        {
          messageId: 'noUseEffectInHook',
          data: { hookName: 'useLayoutEffect' },
        },
      ],
    },
    // useLayoutEffect in custom hook (arrow function)
    {
      code: `
        import { useLayoutEffect } from 'react';
        export const useCustomLayout = () => {
          useLayoutEffect(() => {
            console.log('layout effect');
          }, []);
        };
      `,
      filename: '/path/to/useCustomLayout.tsx',
      errors: [
        {
          messageId: 'noUseEffectInHook',
          data: { hookName: 'useLayoutEffect' },
        },
      ],
    },
    // Multiple useEffect calls in custom hook
    {
      code: `
        import { useEffect } from 'react';
        function useMultiEffect() {
          useEffect(() => {}, []);
          useEffect(() => {}, []);
        }
      `,
      filename: '/path/to/useMultiEffect.tsx',
      errors: [
        {
          messageId: 'noUseEffectInHook',
          data: { hookName: 'useEffect' },
        },
        {
          messageId: 'noUseEffectInHook',
          data: { hookName: 'useEffect' },
        },
      ],
    },
    // Nested custom hooks
    {
      code: `
        import { useEffect } from 'react';
        export function useOuter() {
          const useInner = () => {
            useEffect(() => {}, []);
          };
          return useInner;
        }
      `,
      filename: '/path/to/useOuter.tsx',
      errors: [
        {
          messageId: 'noUseEffectInHook',
          data: { hookName: 'useEffect' },
        },
      ],
    },
  ],
});

console.log('All no-use-effect-in-hooks tests passed!');
