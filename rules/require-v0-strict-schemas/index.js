'use strict';

/**
 * @fileoverview Rule to enforce that v0 API schemas use .strict() on z.object()
 * @author Factory Infrastructure Team
 */

//------------------------------------------------------------------------------
// Rule definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'require that v0 API Zod schemas use .strict() on z.object()',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingStrict:
        'v0 API schemas must use .strict() on z.object() to reject unknown properties. Add .strict() after the object definition.',
    },
  },

  create(context) {
    const filename = context.getFilename();

    // Only apply to v0 API schema and route files
    if (!filename.includes('/api/v0/')) {
      return {};
    }

    // Check schema files and route files only
    const isSchemaFile = filename.includes('/schemas/');
    const isRouteFile = filename.endsWith('route.ts');

    if (!isSchemaFile && !isRouteFile) {
      return {};
    }

    function isZodObjectCall(node) {
      // Detect z.object({...})
      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'z' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'object'
      ) {
        return true;
      }
      return false;
    }

    function isExtendCall(node) {
      // Detect SomeSchema.extend({...})
      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'extend'
      ) {
        return true;
      }
      return false;
    }

    function hasStrictInChain(node) {
      // Walk up the chain to find a .strict() call
      let current = node;
      let parent = current.parent;

      while (parent) {
        if (parent.type === 'MemberExpression' && parent.object === current) {
          // Check for a .strict member
          if (
            parent.property.type === 'Identifier' &&
            parent.property.name === 'strict'
          ) {
            return true;
          }
          // Continue through member access (e.g., .extend, .describe)
          current = parent;
          parent = current.parent;
        } else if (
          parent.type === 'CallExpression' &&
          parent.callee === current
        ) {
          // This is a method call; continue up the chain
          current = parent;
          parent = current.parent;
        } else {
          break;
        }
      }

      return false;
    }

    function findChainEnd(node) {
      // Find the end of the chain starting from z.object()
      let current = node;
      let parent = current.parent;

      while (parent) {
        if (
          parent.type === 'CallExpression' &&
          parent.callee.type === 'MemberExpression' &&
          parent.callee.object === current
        ) {
          current = parent;
          parent = current.parent;
        } else if (
          parent.type === 'MemberExpression' &&
          parent.object === current
        ) {
          current = parent;
          parent = current.parent;
        } else {
          break;
        }
      }

      return current;
    }

    return {
      CallExpression(node) {
        if (isZodObjectCall(node) || isExtendCall(node)) {
          if (!hasStrictInChain(node)) {
            const chainEnd = findChainEnd(node);
            context.report({
              node: chainEnd,
              messageId: 'missingStrict',
              fix(fixer) {
                return fixer.insertTextAfter(chainEnd, '.strict()');
              },
            });
          }
        }
      },
    };
  },
};
