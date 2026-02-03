/**
 * @fileoverview Require jest.mock() to include a second arg with jest.requireActual()
 * @author Factory Infrastructure Team
 */

'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce that jest.mock() calls have 2 arguments and the second contains jest.requireActual()',
      category: 'Testing',
      recommended: true,
    },
    messages: {
      missingSecondArgument:
        'jest.mock() must have a second argument to prevent auto-mocking all exports',
      missingRequireActual:
        'The second argument of jest.mock() must contain a call to jest.requireActual()',
      pointlessRequireActualOnly:
        'jest.mock() that only spreads jest.requireActual() is pointless and should be removed',
    },
    fixable: 'code',
    schema: [], // no options supported
  },

  create(context) {
    const filename = context.getFilename
      ? context.getFilename()
      : context.filename || '';
    const sourceCode = context.getSourceCode();

    // Only apply this rule to test files
    const isTestFile =
      filename.includes('.test.') ||
      filename.includes('.spec.') ||
      filename.includes('__tests__/');

    if (!isTestFile) {
      return {};
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
     * Check whether a node is a jest.requireActual() call.
     * @param {Object} node - The AST node to check
     * @returns {boolean} True if it is a jest.requireActual() call
     */
    function isJestRequireActualCall(node) {
      return (
        node &&
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'jest' &&
        node.callee.property &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'requireActual'
      );
    }

    /**
     * Check whether a mock function only spreads jest.requireActual() with no additions.
     * @param {Object} node - The function node (ArrowFunctionExpression or FunctionExpression)
     * @returns {boolean} True if it only spreads jest.requireActual()
     */
    function isPointlessRequireActualOnly(node) {
      if (!node) return false;

      // Handle arrow function: () => ({ ...jest.requireActual('module') })
      if (node.type === 'ArrowFunctionExpression') {
        const body = node.body;

        // Check for object expression bodies
        if (body && body.type === 'ObjectExpression') {
          return isObjectOnlySpreadingRequireActual(body);
        }

        // Check for block bodies with a return
        if (body && body.type === 'BlockStatement') {
          // Require exactly one return statement
          if (
            body.body.length === 1 &&
            body.body[0].type === 'ReturnStatement'
          ) {
            const returnArg = body.body[0].argument;
            if (returnArg && returnArg.type === 'ObjectExpression') {
              return isObjectOnlySpreadingRequireActual(returnArg);
            }
          }
        }
      }

      // Handle function expressions
      if (node.type === 'FunctionExpression') {
        const body = node.body;
        if (body && body.type === 'BlockStatement') {
          // Require exactly one return statement
          if (
            body.body.length === 1 &&
            body.body[0].type === 'ReturnStatement'
          ) {
            const returnArg = body.body[0].argument;
            if (returnArg && returnArg.type === 'ObjectExpression') {
              return isObjectOnlySpreadingRequireActual(returnArg);
            }
          }
        }
      }

      return false;
    }

    /**
     * Check whether an object expression only spreads jest.requireActual().
     * @param {Object} objectNode - The ObjectExpression node
     * @returns {boolean} True if it only spreads jest.requireActual()
     */
    function isObjectOnlySpreadingRequireActual(objectNode) {
      if (!objectNode || objectNode.type !== 'ObjectExpression') {
        return false;
      }

      const properties = objectNode.properties;
      if (!properties || !Array.isArray(properties)) {
        return false;
      }

      // Must have exactly one property
      if (properties.length !== 1) {
        return false;
      }

      const prop = properties[0];

      // Accept spread elements
      if (prop.type === 'SpreadElement') {
        return isJestRequireActualCall(prop.argument);
      }

      // Handle experimental spread properties in older parsers
      if (
        prop.type === 'SpreadProperty' ||
        prop.type === 'ExperimentalSpreadProperty'
      ) {
        return isJestRequireActualCall(prop.argument);
      }

      return false;
    }

    /**
     * Check whether a node contains a jest.requireActual() call.
     * @param {Object} node - The AST node to check
     * @returns {boolean} True if the node contains jest.requireActual()
     */
    function containsJestRequireActual(node) {
      if (!node) return false;

      // Direct check for jest.requireActual() call
      if (isJestRequireActualCall(node)) {
        return true;
      }

      // Recursively check node types
      switch (node.type) {
        case 'ArrowFunctionExpression':
        case 'FunctionExpression':
          return containsJestRequireActual(node.body);

        case 'BlockStatement':
          return node.body && Array.isArray(node.body)
            ? node.body.some((statement) =>
                containsJestRequireActual(statement)
              )
            : false;

        case 'ReturnStatement':
          return containsJestRequireActual(node.argument);

        case 'ObjectExpression':
          // Ensure properties exists and is an array
          if (!node.properties || !Array.isArray(node.properties)) {
            return false;
          }
          return node.properties.some((prop) => {
            // Handle SpreadElement directly in properties array
            if (prop.type === 'SpreadElement') {
              return containsJestRequireActual(prop.argument);
            }
            // Handle regular Property nodes
            if (prop.type === 'Property') {
              return containsJestRequireActual(prop.value);
            }
            // Handle experimental SpreadProperty (older parsers)
            if (
              prop.type === 'SpreadProperty' ||
              prop.type === 'ExperimentalSpreadProperty'
            ) {
              return containsJestRequireActual(prop.argument);
            }
            return false;
          });

        case 'SpreadElement':
          return containsJestRequireActual(node.argument);

        case 'CallExpression':
          // Check if this is jest.requireActual()
          if (
            node.callee &&
            node.callee.type === 'MemberExpression' &&
            node.callee.object &&
            node.callee.object.type === 'Identifier' &&
            node.callee.object.name === 'jest' &&
            node.callee.property &&
            node.callee.property.type === 'Identifier' &&
            node.callee.property.name === 'requireActual'
          ) {
            return true;
          }
          // Check arguments
          return node.arguments && Array.isArray(node.arguments)
            ? node.arguments.some((arg) => containsJestRequireActual(arg))
            : false;

        case 'MemberExpression':
          return (
            containsJestRequireActual(node.object) ||
            containsJestRequireActual(node.property)
          );

        case 'ArrayExpression':
          return node.elements && Array.isArray(node.elements)
            ? node.elements.some((element) =>
                containsJestRequireActual(element)
              )
            : false;

        case 'ConditionalExpression':
          return (
            containsJestRequireActual(node.test) ||
            containsJestRequireActual(node.consequent) ||
            containsJestRequireActual(node.alternate)
          );

        case 'LogicalExpression':
        case 'BinaryExpression':
          return (
            containsJestRequireActual(node.left) ||
            containsJestRequireActual(node.right)
          );

        case 'UnaryExpression':
        case 'UpdateExpression':
          return containsJestRequireActual(node.argument);

        case 'AssignmentExpression':
          return (
            containsJestRequireActual(node.left) ||
            containsJestRequireActual(node.right)
          );

        case 'ExpressionStatement':
          return containsJestRequireActual(node.expression);

        case 'VariableDeclaration':
          return node.declarations && Array.isArray(node.declarations)
            ? node.declarations.some((decl) =>
                containsJestRequireActual(decl.init)
              )
            : false;

        case 'VariableDeclarator':
          return containsJestRequireActual(node.init);

        case 'TemplateLiteral':
          return node.expressions && Array.isArray(node.expressions)
            ? node.expressions.some((expr) => containsJestRequireActual(expr))
            : false;

        case 'TaggedTemplateExpression':
          return (
            containsJestRequireActual(node.tag) ||
            containsJestRequireActual(node.quasi)
          );

        case 'NewExpression':
          return (
            containsJestRequireActual(node.callee) ||
            (node.arguments && Array.isArray(node.arguments)
              ? node.arguments.some((arg) => containsJestRequireActual(arg))
              : false)
          );

        case 'SequenceExpression':
          return node.expressions && Array.isArray(node.expressions)
            ? node.expressions.some((expr) => containsJestRequireActual(expr))
            : false;

        default:
          return false;
      }
    }

    return {
      CallExpression(node) {
        // Check for jest.mock() calls
        if (!isJestMockCall(node)) {
          return;
        }

        // Enforce a second argument
        if (node.arguments.length < 2) {
          context.report({
            node,
            messageId: 'missingSecondArgument',
            fix(fixer) {
              // Extract the module path from the first argument
              const firstArg = node.arguments[0];
              const modulePath = sourceCode.getText(firstArg);

              // Add a second argument with jest.requireActual
              const secondArg = `, () => ({ ...jest.requireActual(${modulePath}) })`;

              // Insert after the first argument
              return fixer.insertTextAfter(firstArg, secondArg);
            },
          });
          return;
        }

        // Ensure the second argument calls jest.requireActual()
        const secondArg = node.arguments[1];
        const hasRequireActual = containsJestRequireActual(secondArg);

        if (!hasRequireActual) {
          context.report({
            node: secondArg || node,
            messageId: 'missingRequireActual',
          });
          return;
        }

        // Flag pointless mocks that only spread jest.requireActual
        if (isPointlessRequireActualOnly(secondArg)) {
          context.report({
            node: secondArg || node,
            messageId: 'pointlessRequireActualOnly',
            fix(fixer) {
              // Remove the entire jest.mock() statement
              // Find the ExpressionStatement
              let statement = node;
              while (statement.parent && statement.parent.type !== 'Program') {
                if (statement.parent.type === 'ExpressionStatement') {
                  statement = statement.parent;
                  break;
                }
                statement = statement.parent;
              }

              // Remove the entire statement including semicolon and newline
              return fixer.remove(statement);
            },
          });
        }
      },
    };
  },
};
