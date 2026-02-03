module.exports = {
  parser: '@typescript-eslint/parser',
  globals: {
    NodeJS: true,
    FileSystemFileHandle: true,
    FileSystemHandle: true,
    FileSystemDirectoryHandle: true,
    FileSystemPermissionMode: true,
    FileSystemHandlePermissionDescriptor: true,
    FileSystemWritableFileStream: true,
    globalThis: 'readonly',
  },
  extends: [
    'eslint-config-airbnb-base',
    'plugin:jest/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: true,
      },
      node: {
        project: true,
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  ignorePatterns: ['build/**/*', 'dist/**/*', 'coverage/**/*'],
  plugins: [
    '@typescript-eslint',
    'eslint-comments',
    'unused-imports',
    'no-barrel-files',
  ],
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-empty-object-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    // Handled by "unused-imports/no-unused-vars" instead.
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    'no-barrel-files/no-barrel-files': 'error',
    // Import rules
    'import/extensions': [
      'error',
      'never',
      {
        json: 'always',
      },
    ],
    'import/named': 'error',
    'import/no-cycle': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        packageDir: ['.', '../..'], // Include the workspace root package.json
      },
    ],
    'import/no-default-export': 'error',
    'import/no-unresolved': [
      'error',
      {
        ignore: ['^@factory/'],
      },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'type',
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'parent',
          },
        ],
        distinctGroup: false,
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'eslint-comments/no-unused-disable': 'error',
    'no-void': [
      'error',
      {
        allowAsStatement: true,
      },
    ],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: false,
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    // General rules
    'class-methods-use-this': 'error',
    'default-case': 'error',
    'no-console': 'error',
    'no-constant-condition': [
      'error',
      {
        checkLoops: false,
      },
    ],
    'no-param-reassign': [
      'error',
      {
        props: false,
      },
    ],
    'no-restricted-globals': 'error',
    'no-promise-executor-return': 'error',
    'prefer-promise-reject-errors': 'error',
    'jest/expect-expect': 'error',
    // Covered by unused-imports
    'no-unused-vars': 'off',
  },
};
