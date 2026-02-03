'use strict';

/**
 * @fileoverview Tests for no-exported-string-union-types rule
 * @author Factory Infrastructure Team
 */

const { RuleTester } = require('eslint');
const rule = require('./index');

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('no-exported-string-union-types', rule, {
  valid: [
    // Non-exported string union type is allowed
    {
      code: `type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';`,
      filename: 'src/types.ts',
    },

    // Exported enum is allowed
    {
      code: `export enum Direction { UP = 'UP', DOWN = 'DOWN' }`,
      filename: 'src/enums.ts',
    },

    // Exported interface is allowed
    {
      code: `export interface User { id: string; name: string; }`,
      filename: 'src/types.ts',
    },

    // Exported type that is not a string union is allowed
    {
      code: `export type UserId = string;`,
      filename: 'src/types.ts',
    },

    // Exported number union is allowed
    {
      code: `export type StatusCode = 200 | 400 | 500;`,
      filename: 'src/types.ts',
    },

    // Mixed union (string + other) is allowed
    {
      code: `export type MixedType = 'foo' | number;`,
      filename: 'src/types.ts',
    },

    // Union with null/undefined is allowed
    {
      code: `export type NullableString = string | null;`,
      filename: 'src/types.ts',
    },

    // Generic type is allowed
    {
      code: `export type Container<T> = { value: T };`,
      filename: 'src/types.ts',
    },
  ],

  invalid: [
    // Exported string union type
    {
      code: `export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';`,
      filename: 'src/types.ts',
      errors: [{ messageId: 'useEnumInstead' }],
    },

    // Exported string union with two values
    {
      code: `export type Status = 'active' | 'inactive';`,
      filename: 'src/types.ts',
      errors: [{ messageId: 'useEnumInstead' }],
    },

    // Exported string union in named export
    {
      code: `export type Theme = 'light' | 'dark';`,
      filename: 'src/theme.ts',
      errors: [{ messageId: 'useEnumInstead' }],
    },
  ],
});
