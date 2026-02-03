'use strict';

/**
 * @fileoverview Rule to enforce that v0 API routes use handleV0RouteMiddleware
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
        'require that v0 API route handlers use handleV0RouteMiddleware',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingMiddleware:
        'v0 API route handlers must call handleV0RouteMiddleware. Usage: .handler(async (req) => handleV0RouteMiddleware(req, async (user) => { ... }))',
    },
  },

  create(context) {
    const filename = context.getFilename();

    // Only apply to v0 API route files
    if (!filename.includes('/api/v0/') || !filename.endsWith('route.ts')) {
      return {};
    }

    function isHandleV0RouteMiddlewareCall(node) {
      if (!node) return false;

      // Direct call: handleV0RouteMiddleware(...)
      if (node.type === 'CallExpression') {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'handleV0RouteMiddleware'
        ) {
          return true;
        }
      }

      return false;
    }

    function handlerCallsMiddleware(handlerNode) {
      if (!handlerNode) return false;

      // Arrow function with expression body: async (req) => handleV0RouteMiddleware(...)
      if (
        handlerNode.type === 'ArrowFunctionExpression' &&
        handlerNode.body.type !== 'BlockStatement'
      ) {
        return isHandleV0RouteMiddlewareCall(handlerNode.body);
      }

      // Arrow function or function expression with block body
      const body =
        handlerNode.body && handlerNode.body.type === 'BlockStatement'
          ? handlerNode.body.body
          : [];

      if (!Array.isArray(body) || body.length === 0) return false;

      // Check the first non-empty statement
      for (const stmt of body) {
        if (stmt.type === 'EmptyStatement') continue;

        // return handleV0RouteMiddleware(...)
        if (stmt.type === 'ReturnStatement' && stmt.argument) {
          return isHandleV0RouteMiddlewareCall(stmt.argument);
        }

        // handleV0RouteMiddleware(...) as expression statement
        if (stmt.type === 'ExpressionStatement') {
          return isHandleV0RouteMiddlewareCall(stmt.expression);
        }

        break;
      }

      return false;
    }

    const handlerCallsToValidate = [];

    return {
      // Look for .handler() calls in method chains
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'handler' &&
          node.arguments.length > 0
        ) {
          const handlerArg = node.arguments[0];
          if (
            handlerArg.type === 'ArrowFunctionExpression' ||
            handlerArg.type === 'FunctionExpression'
          ) {
            handlerCallsToValidate.push({ node, handlerArg });
          }
        }
      },

      'Program:exit'() {
        for (const { node, handlerArg } of handlerCallsToValidate) {
          if (!handlerCallsMiddleware(handlerArg)) {
            context.report({
              node,
              messageId: 'missingMiddleware',
            });
          }
        }
      },
    };
  },
};
