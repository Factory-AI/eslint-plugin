/**
 * @fileoverview Disallow useEffect and useMountEffect in custom hooks
 */

'use strict';

/**
 * Check whether a node is inside a custom hook (function name starts with "use").
 * @param {import('eslint').Rule.Node[]} ancestors
 * @returns {boolean}
 */
function isInsideCustomHook(ancestors) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const node = ancestors[i];

    // Match function declarations: function useSomething() {}
    if (node.type === 'FunctionDeclaration' && node.id) {
      if (node.id.name.startsWith('use')) {
        return true;
      }
    }

    // Match variable declarations with arrow/function expressions:
    // const useSomething = () => {}
    // const useSomething = function() {}
    if (node.type === 'VariableDeclarator' && node.id) {
      if (node.id.type === 'Identifier' && node.id.name.startsWith('use')) {
        return true;
      }
    }

    // Match exported arrow/function: export const useSomething = () => {}
    if (node.type === 'ExportNamedDeclaration') {
      const declaration = node.declaration;
      if (declaration && declaration.type === 'VariableDeclaration') {
        for (const declarator of declaration.declarations) {
          if (
            declarator.id &&
            declarator.id.type === 'Identifier' &&
            declarator.id.name.startsWith('use')
          ) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow useEffect and useMountEffect in custom hooks',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noUseEffectInHook:
        'Do not use {{hookName}} inside custom hooks. Side effects should be managed by the components that use the hook, not by the hook itself.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    const base = filename.split('/').pop() || '';
    const sourceCode = context.getSourceCode();

    // Ignore test files
    if (base.includes('.test.') || base.includes('.spec.')) {
      return {};
    }

    return {
      CallExpression(node) {
        const { callee } = node;

        // Catch useEffect/useMountEffect-style calls
        if (callee.type === 'Identifier') {
          const hookName = callee.name;

          if (hookName.toLowerCase().endsWith('effect')) {
            const ancestors = sourceCode.getAncestors(node);

            if (isInsideCustomHook(ancestors)) {
              context.report({
                node,
                messageId: 'noUseEffectInHook',
                data: { hookName },
              });
            }
          }
        }
      },
    };
  },
};
