/**
 * @fileoverview Require exported functions to be declarations (not expressions)
 * @author Factory Infrastructure Team
 */

'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require exported functions to be function declarations',
      category: 'ECMAScript 6',
      recommended: true,
    },
    messages: {
      useFunctionDeclaration:
        'Exported function expressions are not allowed. Use a function declaration instead.',
    },
    schema: [], // no options supported
  },

  create(context) {
    return {
      // Report named exports that use function expressions
      ExportNamedDeclaration(node) {
        if (
          node.declaration &&
          node.declaration.type === 'VariableDeclaration'
        ) {
          // Inspect each variable declarator
          node.declaration.declarations.forEach((declarator) => {
            if (
              declarator.init &&
              (declarator.init.type === 'ArrowFunctionExpression' ||
                declarator.init.type === 'FunctionExpression')
            ) {
              context.report({
                node: declarator.id,
                messageId: 'useFunctionDeclaration',
              });
            }
          });
        }
      },

      // Report default exports that use function expressions
      ExportDefaultDeclaration(node) {
        if (
          node.declaration.type === 'ArrowFunctionExpression' ||
          node.declaration.type === 'FunctionExpression'
        ) {
          context.report({
            node: node.declaration,
            messageId: 'useFunctionDeclaration',
          });
        }
      },
    };
  },
};
