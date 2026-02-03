/**
 * @fileoverview Require jest.mock() to use absolute paths (no relative paths)
 * @author Factory Infrastructure Team
 */

'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that jest.mock() uses absolute paths only',
      category: 'Testing',
      recommended: true,
    },
    messages: {
      relativePathInJestMock:
        'jest.mock() must use absolute paths. Use an absolute path instead of "{{path}}"',
      requireInJestMock:
        'jest.mock() should not use require.resolve(). Use the absolute path directly',
    },
    fixable: null,
    schema: [], // no options supported
  },

  create(context) {
    const filename = context.getFilename();

    // Only run this rule in test files
    const isTestFile =
      filename.includes('.test.') ||
      filename.includes('.spec.') ||
      filename.includes('__tests__/');

    if (!isTestFile) {
      return {};
    }

    /**
     * Check whether a path is relative.
     * @param {string} path - The path to check
     * @returns {boolean} True if the path is relative
     */
    function isRelativePath(path) {
      return path.startsWith('.') || path.startsWith('..');
    }

    /**
     * Check whether a node is a jest.mock() call.
     * @param {Object} node - The AST node
     * @returns {boolean} True if it is a jest.mock() call
     */
    function isJestMockCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'jest' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'mock'
      );
    }

    /**
     * Check whether a node is jest.doMock() or jest.unmock().
     * @param {Object} node - The AST node
     * @returns {boolean} True if it is jest.doMock()/jest.unmock()/jest.dontMock()
     */
    function isJestMockVariant(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'jest' &&
        node.callee.property.type === 'Identifier' &&
        ['doMock', 'unmock', 'dontMock'].includes(node.callee.property.name)
      );
    }

    return {
      CallExpression(node) {
        // Handle jest.mock(), jest.doMock(), jest.unmock(), jest.dontMock()
        if (!isJestMockCall(node) && !isJestMockVariant(node)) {
          return;
        }

        // Read the first argument (module path)
        const firstArg = node.arguments[0];
        if (!firstArg) {
          return;
        }

        // Report string literals that use relative paths
        if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
          const modulePath = firstArg.value;

          if (isRelativePath(modulePath)) {
            context.report({
              node: firstArg,
              messageId: 'relativePathInJestMock',
              data: {
                path: modulePath,
              },
            });
          }
        }

        // Report template literals that start with a relative path
        if (firstArg.type === 'TemplateLiteral' && firstArg.quasis.length > 0) {
          // Check only the leading quasi to detect relative paths
          const firstQuasi = firstArg.quasis[0];
          if (firstQuasi && firstQuasi.value && firstQuasi.value.cooked) {
            const pathStart = firstQuasi.value.cooked;
            if (isRelativePath(pathStart)) {
              context.report({
                node: firstArg,
                messageId: 'relativePathInJestMock',
                data: {
                  path: pathStart + '...',
                },
              });
            }
          }
        }

        // Disallow require.resolve() in jest.mock
        if (
          firstArg.type === 'CallExpression' &&
          firstArg.callee.type === 'MemberExpression' &&
          firstArg.callee.object.type === 'Identifier' &&
          firstArg.callee.object.name === 'require' &&
          firstArg.callee.property.type === 'Identifier' &&
          firstArg.callee.property.name === 'resolve'
        ) {
          context.report({
            node: firstArg,
            messageId: 'requireInJestMock',
          });
        }
      },
    };
  },
};
