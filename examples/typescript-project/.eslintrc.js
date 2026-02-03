module.exports = {
  root: true,
  plugins: ['@factory'],
  extends: ['plugin:@factory/recommended'],
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    react: {
      version: '18.0', // Suppresses React version warning for non-React projects
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
