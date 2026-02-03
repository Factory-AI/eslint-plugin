/**
 * @fileoverview Tests for restrict-tsx-components rule
 * @author Factory Infrastructure Team
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('./index');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('restrict-tsx-components', rule, {
  valid: [
    // Components declared in .page.tsx files are allowed
    {
      code: `export const SessionsPage = () => <div>Sessions</div>;`,
      filename: '/path/to/Sessions.page.tsx',
      options: [{ allowlist: [] }],
    },
    {
      code: `export default function HomePage() { return <div>Home</div>; }`,
      filename: '/path/to/Home.page.tsx',
      options: [{ allowlist: [] }],
    },
    // Components declared in .module.tsx files are allowed
    {
      code: `export const Button = () => <button>Click</button>;`,
      filename: '/path/to/Button.module.tsx',
      options: [{ allowlist: [] }],
    },
    {
      code: `export default function Card() { return <div>Card</div>; }`,
      filename: '/path/to/Card.module.tsx',
      options: [{ allowlist: [] }],
    },
    // Allowlisted components can be declared anywhere
    {
      code: `export const MyComponent = () => <div>Test</div>;`,
      filename: '/path/to/MyComponent.tsx',
      options: [{ allowlist: ['MyComponent'] }],
    },
    {
      code: `export default function Tooltip() { return <div>Tooltip</div>; }`,
      filename: '/path/to/Tooltip.tsx',
      options: [{ allowlist: ['Tooltip'] }],
    },
    // Test files are ignored
    {
      code: `export const TestComponent = () => <div>Test</div>;`,
      filename: '/path/to/Component.test.tsx',
      options: [{ allowlist: [] }],
    },
    {
      code: `export const StoryComponent = () => <div>Story</div>;`,
      filename: '/path/to/Component.stories.tsx',
      options: [{ allowlist: [] }],
    },
    // Non-TSX files are ignored
    {
      code: `export const myFunction = () => 'hello';`,
      filename: '/path/to/utils.ts',
      options: [{ allowlist: [] }],
    },
    // Lowercase exports are not components
    {
      code: `export const myHelper = () => <div>Helper</div>;`,
      filename: '/path/to/helpers.tsx',
      options: [{ allowlist: [] }],
    },
    // Components declared in .layout.tsx files are allowed
    {
      code: `export const AppLayout = () => <div>Layout</div>;`,
      filename: '/path/to/AppLayout.layout.tsx',
      options: [{ allowlist: [] }],
    },
    {
      code: `export default function RootLayout() { return <div>Root</div>; }`,
      filename: '/path/to/RootLayout.layout.tsx',
      options: [{ allowlist: [] }],
    },
    // Components declared in .view.tsx files are allowed
    {
      code: `export const LoadingView = () => <div>Loading...</div>;`,
      filename: '/path/to/LoadingView.view.tsx',
      options: [{ allowlist: [] }],
    },
    {
      code: `export default function ErrorView() { return <div>Error</div>; }`,
      filename: '/path/to/ErrorView.view.tsx',
      options: [{ allowlist: [] }],
    },
    // Components declared in .provider.tsx files are allowed
    {
      code: `export const AuthProvider = () => <div>Auth</div>;`,
      filename: '/path/to/AuthProvider.provider.tsx',
      options: [{ allowlist: [] }],
    },
    {
      code: `export default function ThemeProvider() { return <div>Theme</div>; }`,
      filename: '/path/to/ThemeProvider.provider.tsx',
      options: [{ allowlist: [] }],
    },
  ],

  invalid: [
    // Component declared in regular .tsx file (not .page.tsx or .module.tsx)
    {
      code: `export const MyComponent = () => <div>Test</div>;`,
      filename: '/path/to/MyComponent.tsx',
      options: [{ allowlist: [] }],
      errors: [
        {
          messageId: 'restrictedComponent',
          data: {
            componentName: 'MyComponent',
          },
        },
      ],
    },
    {
      code: `export default function Card() { return <div>Card</div>; }`,
      filename: '/path/to/Card.tsx',
      options: [{ allowlist: [] }],
      errors: [
        {
          messageId: 'restrictedComponent',
          data: {
            componentName: 'Card',
          },
        },
      ],
    },
    // Component not in allowlist should be restricted
    {
      code: `export const Button = () => <button>Click</button>;`,
      filename: '/path/to/Button.tsx',
      options: [{ allowlist: ['Input'] }],
      errors: [
        {
          messageId: 'restrictedComponent',
          data: {
            componentName: 'Button',
          },
        },
      ],
    },
    // Multiple components in same file
    {
      code: `
        export const Foo = () => <div>Foo</div>;
        export const Bar = () => <div>Bar</div>;
      `,
      filename: '/path/to/components.tsx',
      options: [{ allowlist: [] }],
      errors: [
        {
          messageId: 'restrictedComponent',
          data: {
            componentName: 'Foo',
          },
        },
        {
          messageId: 'restrictedComponent',
          data: {
            componentName: 'Bar',
          },
        },
      ],
    },
    // Function declaration export
    {
      code: `export function Modal() { return <div>Modal</div>; }`,
      filename: '/path/to/Modal.tsx',
      options: [{ allowlist: [] }],
      errors: [
        {
          messageId: 'restrictedComponent',
          data: {
            componentName: 'Modal',
          },
        },
      ],
    },
    // Default export of identifier
    {
      code: `
        const Dialog = () => <div>Dialog</div>;
        export default Dialog;
      `,
      filename: '/path/to/Dialog.tsx',
      options: [{ allowlist: [] }],
      errors: [
        {
          messageId: 'restrictedComponent',
          data: {
            componentName: 'Dialog',
          },
        },
      ],
    },
  ],
});

console.log('All restrict-tsx-components tests passed!');
