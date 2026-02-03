/**
 * Jest configuration for @factory/eslint-config package
 */
module.exports = {
  // Use the Node test environment because ESLint rules execute in Node
  testEnvironment: 'node',

  // Search for tests under this package
  roots: ['<rootDir>'],

  // Match *.test.js files
  testMatch: ['**/*.test.js'],

  // Reset mocks between tests to avoid cross-test leakage
  clearMocks: true,

  // Log individual test results
  verbose: true,

  // Collect coverage from rule implementations only
  collectCoverageFrom: ['rules/*.js', '!rules/*.test.js', '!rules/index.js'],

  // Enforce minimum coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
