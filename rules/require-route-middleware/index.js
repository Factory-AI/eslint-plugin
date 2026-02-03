'use strict';

/**
 * @fileoverview Rule to enforce that route.ts files call handle*Middleware as the very first statement
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
        'require that route.ts files call handle*Middleware as the very first statement of each exported HTTP handler',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingMiddleware:
        'The first statement of each exported route handler must be a call to a handle*Middleware function (e.g., handleRouteMiddleware, handleAdminRouteMiddleware, handleCronMiddleware, handlePublicMiddleware).',
    },
  },

  create(context) {
    // Only apply to route.ts files
    const filename = context.getFilename();
    if (!filename.endsWith('route.ts')) {
      return {};
    }

    // Skip v0 API routes; they use handleV0RouteMiddleware inside .handler()
    // and are covered by require-v0-route-handle-middleware instead.
    if (filename.includes('/api/v0/')) {
      return {};
    }

    const HTTP_METHODS = new Set([
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS',
      'HEAD',
    ]);

    const handlersToValidate = [];
    let hasFactoryStyleHandler = false; // e.g. export const POST = createXHandler(...)

    function isHandleMiddlewareCallee(callee) {
      if (!callee) return false;
      if (callee.type === 'Identifier') {
        return (
          typeof callee.name === 'string' &&
          callee.name.startsWith('handle') &&
          callee.name.endsWith('Middleware')
        );
      }
      if (
        callee.type === 'MemberExpression' &&
        callee.property &&
        callee.property.type === 'Identifier'
      ) {
        const name = callee.property.name;
        return name.startsWith('handle') && name.endsWith('Middleware');
      }
      return false;
    }

    function expressionIsMiddlewareCall(expr) {
      if (!expr) return false;
      if (expr.type === 'CallExpression')
        return isHandleMiddlewareCallee(expr.callee);
      if (expr.type === 'AwaitExpression' && expr.argument) {
        return (
          expr.argument.type === 'CallExpression' &&
          isHandleMiddlewareCallee(expr.argument.callee)
        );
      }
      return false;
    }

    function firstStatementCallsMiddleware(fnNode) {
      if (!fnNode) return false;
      // Arrow function with expression body
      if (
        fnNode.type === 'ArrowFunctionExpression' &&
        fnNode.body &&
        fnNode.body.type !== 'BlockStatement'
      ) {
        return expressionIsMiddlewareCall(fnNode.body);
      }

      const body =
        fnNode.body && fnNode.body.type === 'BlockStatement'
          ? fnNode.body.body
          : [];
      if (!Array.isArray(body) || body.length === 0) return false;

      // Skip directives like 'use strict' / 'use server'
      let first = null;
      for (const stmt of body) {
        if (stmt.type === 'EmptyStatement') continue;
        if (Object.prototype.hasOwnProperty.call(stmt, 'directive')) continue;
        first = stmt;
        break;
      }
      if (!first) return false;

      if (first.type === 'ReturnStatement') {
        return expressionIsMiddlewareCall(first.argument);
      }
      if (first.type === 'ExpressionStatement') {
        return expressionIsMiddlewareCall(first.expression);
      }
      if (first.type === 'VariableDeclaration') {
        for (const decl of first.declarations || []) {
          const init = decl && decl.init;
          if (!init) continue;
          if (
            init.type === 'CallExpression' &&
            isHandleMiddlewareCallee(init.callee)
          ) {
            return true;
          }
          if (
            init.type === 'AwaitExpression' &&
            init.argument &&
            init.argument.type === 'CallExpression' &&
            isHandleMiddlewareCallee(init.argument.callee)
          ) {
            return true;
          }
        }
        return false;
      }
      return false;
    }

    function isFunctionLike(node) {
      return (
        node &&
        (node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression')
      );
    }

    function isFactoryHandlerCall(init) {
      return (
        init &&
        init.type === 'CallExpression' &&
        ((init.callee.type === 'Identifier' &&
          (init.callee.name.includes('Handler') ||
            init.callee.name.includes('Middleware'))) ||
          (init.callee.type === 'MemberExpression' &&
            init.callee.property &&
            init.callee.property.type === 'Identifier' &&
            (init.callee.property.name.includes('Handler') ||
              init.callee.property.name.includes('Middleware'))))
      );
    }

    return {
      ExportNamedDeclaration(node) {
        // export async function GET(...) {}
        if (
          node.declaration &&
          node.declaration.type === 'FunctionDeclaration'
        ) {
          const fn = node.declaration;
          if (fn.id && HTTP_METHODS.has(fn.id.name)) {
            handlersToValidate.push(fn);
          }
        }

        // export const GET = ...
        if (
          node.declaration &&
          node.declaration.type === 'VariableDeclaration'
        ) {
          for (const declarator of node.declaration.declarations) {
            const id = declarator.id;
            const init = declarator.init;
            if (id && id.type === 'Identifier' && HTTP_METHODS.has(id.name)) {
              if (isFunctionLike(init)) {
                handlersToValidate.push(init);
              } else if (isFactoryHandlerCall(init)) {
                hasFactoryStyleHandler = true;
              }
            } else if (isFactoryHandlerCall(init)) {
              // Allow other exported variables that create handler/middleware
              hasFactoryStyleHandler = true;
            }
          }
        }
      },

      // Support CommonJS: exports.GET = createXHandler(...) or function
      AssignmentExpression(node) {
        if (
          node.left &&
          node.left.type === 'MemberExpression' &&
          node.left.object &&
          node.left.object.type === 'Identifier' &&
          node.left.object.name === 'exports' &&
          node.left.property &&
          node.left.property.type === 'Identifier' &&
          HTTP_METHODS.has(node.left.property.name)
        ) {
          const right = node.right;
          if (isFunctionLike(right)) {
            handlersToValidate.push(right);
          } else if (isFactoryHandlerCall(right)) {
            hasFactoryStyleHandler = true;
          }
        }
      },

      'Program:exit'() {
        let anyValid = false;
        let anyHandlersFound = handlersToValidate.length > 0;

        for (const fn of handlersToValidate) {
          const ok = firstStatementCallsMiddleware(fn);
          if (ok) anyValid = true;
          else {
            context.report({ node: fn, messageId: 'missingMiddleware' });
          }
        }

        if (!anyHandlersFound && !hasFactoryStyleHandler) {
          context.report({
            node: context.getSourceCode().ast,
            messageId: 'missingMiddleware',
          });
        }
      },
    };
  },
};
