/**
 * @fileoverview Tests for require-tsx-test-stories-files rule
 * @author Factory Infrastructure Team
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('./index');

// Configure RuleTester for TypeScript with JSX
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
ruleTester.run('require-tsx-test-stories-files', rule, {
  valid: [
    // Test files themselves don't need tests
    {
      code: 'describe("Button", () => { it("renders", () => {}); });',
      filename: '/project/src/components/Button.test.tsx',
    },
    // Stories files themselves don't need tests
    {
      code: 'export default { title: "Button" }; export const Primary = {};',
      filename: '/project/src/components/Button.stories.tsx',
    },
    // Index files don't need tests/stories
    {
      code: 'export * from "./Button";',
      filename: '/project/src/components/index.tsx',
    },
    // Next.js App Router files don't need tests/stories
    {
      code: 'export default function Page() { return <div>Page</div>; }',
      filename: '/project/src/app/page.tsx',
    },
    {
      code: 'export default function Layout({ children }) { return <>{children}</>; }',
      filename: '/project/src/app/layout.tsx',
    },
    {
      code: 'export default function Loading() { return <div>Loading...</div>; }',
      filename: '/project/src/app/loading.tsx',
    },
    {
      code: 'export default function Error() { return <div>Error</div>; }',
      filename: '/project/src/app/error.tsx',
    },
    {
      code: 'export default function NotFound() { return <div>404</div>; }',
      filename: '/project/src/app/not-found.tsx',
    },
    // Type definition files are ignored
    {
      code: 'export type Helper = { name: string };',
      filename: '/project/src/utils/types.ts',
    },
  ],
  invalid: [
    {
      code: 'export const Button = () => <button>Click me</button>;',
      filename: '/project/src/components/Button.tsx',
      errors: [
        {
          message:
            'TSX file "Button.tsx" is missing a corresponding test file "Button.test.tsx"',
        },
        {
          message:
            'TSX file "Button.tsx" is missing a corresponding stories file "Button.stories.tsx"',
        },
      ],
    },
    {
      code: 'export const Card = () => <div>Card</div>;',
      filename: '/project/src/components/Card.tsx',
      errors: [
        {
          message:
            'TSX file "Card.tsx" is missing a corresponding test file "Card.test.tsx"',
        },
        {
          message:
            'TSX file "Card.tsx" is missing a corresponding stories file "Card.stories.tsx"',
        },
      ],
    },
  ],
});


