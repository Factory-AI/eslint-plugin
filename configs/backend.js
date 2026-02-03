'use strict';

// Config for apps/* that are not Next.js
const factoryConfig = require('./recommended.js');

module.exports = {
  ...factoryConfig,
  plugins: [...(factoryConfig.plugins || []), 'no-relative-import-paths'],
  rules: {
    ...factoryConfig.rules,
    '@factory/jest-mock-absolute-paths': 'error',
    'no-relative-import-paths/no-relative-import-paths': [
      'error',
      { allowSameFolder: false, rootDir: 'src', prefix: '@' },
    ],
  },
};
