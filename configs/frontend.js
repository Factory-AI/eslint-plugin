'use strict';

// Used for any `packages/` projects

const factoryConfig = require('./recommended.js');

module.exports = {
  ...factoryConfig,
  extends: [
    ...factoryConfig.extends,
    'eslint-config-airbnb/rules/react',
    'eslint-config-airbnb/rules/react-hooks',
    'plugin:react/jsx-runtime',
    'plugin:react/recommended',
    'plugin:@eslint-react/recommended-type-checked-legacy',
  ],
  plugins: [
    ...factoryConfig.plugins,
    '@eslint-react',
    'react-hooks',
    'react-compiler',
  ],
  rules: {
    ...factoryConfig.rules,
    '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'off',
    '@eslint-react/no-array-index-key': 'error',
    'no-barrel-files/no-barrel-files': 'error',
    '@factory/filename-match-export': [
      'error',
      {
        ignoredFiles: ['utils.ts', 'constants.ts', 'types.ts'],
      },
    ],
    'react-compiler/react-compiler': 'error',
    '@factory/nextjs-app-router-files': 0,
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="useEffect"]',
        message:
          'useEffect is banned. Use alternative patterns or specific hooks instead.',
      },
      {
        selector:
          'CallExpression[callee.object.name="React"][callee.property.name="useEffect"]',
        message:
          'React.useEffect is banned. Use alternative patterns or specific hooks instead.',
      },
      {
        selector: 'CallExpression[callee.name="useLayoutEffect"]',
        message:
          'useLayoutEffect is banned. Use alternative patterns or specific hooks instead.',
      },
      {
        selector:
          'CallExpression[callee.object.name="React"][callee.property.name="useLayoutEffect"]',
        message:
          'React.useLayoutEffect is banned. Use alternative patterns or specific hooks instead.',
      },
      {
        selector: 'CallExpression[callee.name="useMemo"]',
        message:
          'useMemo is banned. React Compiler automatically optimizes rendering.',
      },
      {
        selector:
          'CallExpression[callee.object.name="React"][callee.property.name="useMemo"]',
        message:
          'React.useMemo is banned. React Compiler automatically optimizes rendering.',
      },
      {
        selector: 'CallExpression[callee.name="useCallback"]',
        message:
          'useCallback is banned. React Compiler automatically optimizes rendering.',
      },
      {
        selector:
          'CallExpression[callee.object.name="React"][callee.property.name="useCallback"]',
        message:
          'React.useCallback is banned. React Compiler automatically optimizes rendering.',
      },
      {
        selector: 'CallExpression[callee.property.name="then"]',
        message:
          'Promise.then() is banned. Use async/await with try/catch instead.',
      },
      {
        selector: 'CallExpression[callee.property.name="catch"]',
        message:
          'Promise.catch() is banned. Use async/await with try/catch instead.',
      },
      {
        selector:
          'TSTypeReference[typeName.type="TSQualifiedName"][typeName.left.name="React"][typeName.right.name="ChangeEvent"]',
        message:
          'React.ChangeEvent is banned. Import ChangeEvent directly from react instead: import { type ChangeEvent } from "react"',
      },
      {
        selector:
          'TSTypeReference[typeName.type="TSQualifiedName"][typeName.left.name="React"][typeName.right.name="MouseEvent"]',
        message:
          'React.MouseEvent is banned. Import MouseEvent directly from react instead: import { type MouseEvent } from "react"',
      },
      {
        selector:
          'TSTypeReference[typeName.type="TSQualifiedName"][typeName.left.name="React"][typeName.right.name="KeyboardEvent"]',
        message:
          'React.KeyboardEvent is banned. Import KeyboardEvent directly from react instead: import { type KeyboardEvent } from "react"',
      },
      {
        selector:
          'TSTypeReference[typeName.type="TSQualifiedName"][typeName.left.name="React"][typeName.right.name="FormEvent"]',
        message:
          'React.FormEvent is banned. Import FormEvent directly from react instead: import { type FormEvent } from "react"',
      },
      {
        selector:
          'TSTypeReference[typeName.type="TSQualifiedName"][typeName.left.name="React"][typeName.right.name="FocusEvent"]',
        message:
          'React.FocusEvent is banned. Import FocusEvent directly from react instead: import { type FocusEvent } from "react"',
      },
      {
        selector:
          'TSTypeReference[typeName.type="TSQualifiedName"][typeName.left.name="React"][typeName.right.name=/.*Event$/]',
        message:
          'React.* event types are banned. Import event types directly from react instead: import { type EventName } from "react"',
      },
      {
        selector:
          'AssignmentExpression[left.object.name="window"][left.property.name="location"]',
        message:
          'Direct window.location manipulation is banned. Use TanStack Router (router.navigate()) instead.',
      },
      {
        selector:
          'MemberExpression[object.object.name="window"][object.property.name="location"][property.name="href"]',
        message:
          'window.location.href is banned. Use TanStack Router (router.navigate()) instead.',
      },
      {
        selector:
          'MemberExpression[object.object.name="window"][object.property.name="location"][property.name="assign"]',
        message:
          'window.location.assign() is banned. Use TanStack Router (router.navigate()) instead.',
      },
      {
        selector:
          'MemberExpression[object.object.name="window"][object.property.name="location"][property.name="replace"]',
        message:
          'window.location.replace() is banned. Use TanStack Router (router.navigate()) instead.',
      },
      {
        selector:
          'JSXOpeningElement[name.name=/./]:has(JSXAttribute[name.name="as"][value.value="a"]):not(:has(JSXAttribute[name.name="target"][value.value="_blank"]))',
        message:
          'as="a" without target="_blank" is banned. Use SafeLink from @factory/component-library which automatically handles internal (TanStack Router) and external links safely, or add target="_blank" for external links.',
      },
      {
        selector:
          'JSXOpeningElement[name.name="a"]:not(:has(JSXAttribute[name.name="target"][value.value="_blank"]))',
        message:
          '<a> HTML anchor tags without target="_blank" are banned. Use SafeLink from @factory/component-library which automatically handles internal (TanStack Router) and external links safely, or add target="_blank" for external links.',
      },
    ],
    'no-restricted-globals': [
      'error',
      {
        name: 'fetch',
        message: 'fetch() is banned. Use an API client or wrapper instead.',
      },
    ],
    'react/prefer-stateless-function': 'error',
    'react/button-has-type': 'error',
    'react/no-unused-prop-types': 'error',
    'react/jsx-pascal-case': 'error',
    'react/jsx-no-script-url': 'error',
    'react/no-children-prop': 'error',
    'react/no-danger': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
    'react/jsx-fragments': 'error',
    'react/destructuring-assignment': [
      'error',
      'always',
      { destructureInSignature: 'always' },
    ],
    'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary'] }],
    'react/jsx-max-depth': ['error', { max: 5 }],
    'react/jsx-key': [
      'error',
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
        warnOnDuplicates: true,
      },
    ],
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-curly-brace-presence': 'error',
    'react/no-typos': 'error',
    'react/display-name': 'error',
    'react/jsx-filename-extension': [
      'error',
      {
        allow: 'as-needed',
        extensions: ['.jsx', '.tsx'],
      },
    ],
    'react/self-closing-comp': 'error',
    'react/jsx-sort-props': 'error',
    'react/react-in-jsx-scope': 'off', // DISABLED: Unnecessary in Vite
    'react/jsx-one-expression-per-line': 'off', // Conflicts with prettier
    'react/prop-types': 'error',
    'react-hooks/exhaustive-deps': 'error',
    '@factory/no-dynamic-styled-components': 'error',
    '@factory/no-plain-html-text-elements': 'error',
    '@factory/no-use-effect-in-hooks': 'error',
    'react/forbid-dom-props': ['error', { forbid: ['style', 'className'] }],
    'react/forbid-component-props': [
      'error',
      { forbid: ['style', 'className'] },
    ],
  },
  overrides: [
    ...factoryConfig.overrides,
    {
      files: ['src/index.ts'],
      rules: {
        'no-barrel-files/no-barrel-files': 'off',
      },
    },
    {
      files: ['**/*.stories.ts', '**/*.stories.tsx'],
      rules: {
        'react/jsx-filename-extension': 'off',
        'import/no-default-export': 'off',
        '@factory/constants-file-organization': 'off',
        '@factory/no-plain-html-text-elements': 'off',
        'no-alert': 'off',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@factory/no-plain-html-text-elements': 'off',
        '@eslint-react/hooks-extra/no-unnecessary-use-prefix': 'off',
      },
    },
  ],
};
