/**
 * @fileoverview Rule to enforce that test utilities (mocks, fixtures) must be in test-utils directories
 * and that test-utils directories follow consistent organization patterns
 * @author Factory Infrastructure Team
 */

'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce test utilities organization',
      category: 'TypeScript',
      recommended: true,
    },
    messages: {
      testUtilsInWrongLocation:
        'Test utilities (mocks, fixtures) should be defined in a test-utils directory',
      incorrectMockNaming:
        'Mock functions should follow naming conventions (e.g., mockX, createMockX)',
    },
    schema: [], // no options supported
  },

  create(context) {
    const filename = context.getFilename();
    const isInTestUtilsDir = filename.includes('/test-utils/');
    const isTypeScriptFile =
      filename.endsWith('.ts') || filename.endsWith('.tsx');
    const isTestFile =
      filename.includes('.test.') || filename.includes('.spec.');

    // Skip non-TypeScript files and test files
    if (!isTypeScriptFile || isTestFile) {
      return {};
    }

    // Validate filenames inside test-utils directories
    const isValidTestUtilsFileName =
      filename.endsWith('/mocks.ts') ||
      filename.endsWith('/fixtures.ts') ||
      filename.endsWith('/helpers.ts') ||
      filename.endsWith('/redux.ts') ||
      filename.endsWith('/index.ts') ||
      filename.includes('/test-utils/mocks/') ||
      filename.includes('/test-utils/fixtures/') ||
      filename.includes('/test-utils/helpers/');

    // Patterns that indicate test utilities (mocks, fixtures, test data)
    const testUtilsPatterns = [
      /mock/i,
      /fixture/i,
      /test.*data/i,
      /createTest/i,
      /createMock/i,
      /testFactory/i,
    ];

    // Patterns for function names that belong in test-utils (tuned to avoid false positives)
    const mockFunctionPatterns = [
      /^mock[A-Z]/,
      /^createMock[A-Z]/,
      /^make(Mock|Test)[A-Z]/,
      /^generate(Mock|Test)[A-Z]/,
      /^fake[A-Z]/,
      /^stub[A-Z]/,
      /TestFactory$/,
      /MockFactory$/,
    ];

    // Allowed testing-library imports
    const testingLibraryImports = [
      /@testing-library/,
      /jest/,
      /vitest/,
      /test-utils/,
      /redux-mock-store/,
      /msw/,
    ];

    // Allowed Redux/testing utility function prefixes
    const testUtilityFunctions = [
      /^render/,
      /^setup/,
      /^initialize.*Test/i,
      /^initialize.*Store/i,
      /^create.*Test/i,
      /^add.*ToStore$/,
      /^with.*Provider$/,
      /Provider$/,
      /^test/i,
      /^make.*ForTest$/i,
    ];

    // Check whether a declaration represents a test utility
    function isTestUtilDeclaration(node) {
      // For variable declarations, inspect the identifier name
      if (node.id && node.id.name) {
        return (
          mockFunctionPatterns.some((pattern) => pattern.test(node.id.name)) ||
          testUtilityFunctions.some((pattern) => pattern.test(node.id.name))
        );
      }

      // For exported declarations, inspect the exported name
      if (node.declaration && node.declaration.id && node.declaration.id.name) {
        return (
          mockFunctionPatterns.some((pattern) =>
            pattern.test(node.declaration.id.name)
          ) ||
          testUtilityFunctions.some((pattern) =>
            pattern.test(node.declaration.id.name)
          )
        );
      }

      return false;
    }

    // Check whether a function is a legitimate helper (not necessarily a mock)
    function isHelperFunction(node) {
      if (!node.id || !node.id.name) return false;

      // Common helper function patterns
      return (
        testUtilityFunctions.some((pattern) => pattern.test(node.id.name)) ||
        // Common helper function name prefixes
        /^(make|create|get|build|format|parse|transform|convert|initialize|setup|prepare|add)/i.test(
          node.id.name
        )
      );
    }

    // Allow type-only imports or testing-library imports
    function isAllowedImport(node) {
      // Allow `import type { X } from 'y';`
      if (node.importKind === 'type') {
        return true;
      }

      // Allow imports from testing libraries
      if (node.source && node.source.value) {
        if (
          testingLibraryImports.some((pattern) =>
            pattern.test(node.source.value)
          )
        ) {
          return true;
        }

        // Allow imports from types/interfaces/enums/constants
        if (
          node.source.value.includes('/interfaces') ||
          node.source.value.includes('/types') ||
          node.source.value.includes('/enums') ||
          node.source.value.includes('/constants')
        ) {
          return true;
        }
      }

      // Allow named imports when all specifiers are types
      if (node.specifiers) {
        return node.specifiers.every(
          (specifier) =>
            specifier.importKind === 'type' ||
            // Common type naming patterns
            (specifier.imported &&
              (/^(Interface|Type|Enum)$/.test(specifier.imported.name) ||
                /^[A-Z].*?(Type|Interface|Config|Options|Props)$/.test(
                  specifier.imported.name
                )))
        );
      }

      return false;
    }

    return {
      // Flag test utility declarations outside test-utils
      'FunctionDeclaration, VariableDeclaration'(node) {
        if (!isInTestUtilsDir) {
          // For function declarations, check naming patterns
          if (node.type === 'FunctionDeclaration' && node.id) {
            if (
              mockFunctionPatterns.some((pattern) => pattern.test(node.id.name))
            ) {
              context.report({
                node,
                messageId: 'testUtilsInWrongLocation',
              });
            }
          }

          // For variable declarations, check each declarator
          if (node.type === 'VariableDeclaration') {
            node.declarations.forEach((declarator) => {
              if (
                declarator.id &&
                declarator.id.type === 'Identifier' &&
                mockFunctionPatterns.some((pattern) =>
                  pattern.test(declarator.id.name)
                )
              ) {
                context.report({
                  node: declarator,
                  messageId: 'testUtilsInWrongLocation',
                });
              }
            });
          }
        }
      },

      // Enforce mock naming conventions inside test-utils
      'VariableDeclarator, FunctionDeclaration'(node) {
        if (isInTestUtilsDir) {
          const name =
            node.type === 'VariableDeclarator' ? node.id?.name : node.id?.name;

          if (name && name.includes('mock') && !name.includes('Mock')) {
            const followsConvention = mockFunctionPatterns.some((pattern) =>
              pattern.test(name)
            );

            if (!followsConvention) {
              context.report({
                node,
                messageId: 'incorrectMockNaming',
              });
            }
          }
        }
      },
    };
  },
};
