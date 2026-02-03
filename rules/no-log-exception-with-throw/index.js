/**
 * @fileoverview Disallow logException()/logError() in the same block as throw
 * @author Factory Infrastructure Team
 */
'use strict';

/**
 * Check whether a node is a logException/logError call.
 * @param {object} node - The AST node to check
 * @returns {boolean} True if the node is a logException or logError call
 */
function isLogExceptionCall(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    (node.callee.name === 'logException' || node.callee.name === 'logError')
  );
}

/**
 * Check whether a node is a throw statement.
 * @param {object} node - The AST node to check
 * @returns {boolean} True if the node is a throw statement
 */
function isThrowStatement(node) {
  return node.type === 'ThrowStatement';
}

/**
 * Get all statements within a block statement or program.
 * @param {object} block - The block or program node
 * @returns {Array} Array of statement nodes
 */
function getStatementsFromBlock(block) {
  if (block.type === 'BlockStatement') {
    return block.body;
  } else if (block.type === 'Program') {
    return block.body;
  }
  return [];
}

/**
 * Check whether two nodes are in the same block.
 * @param {object} node1 - First node
 * @param {object} node2 - Second node
 * @returns {boolean} True if both nodes are in the same block
 */
function areInSameBlock(node1, node2) {
  // Get the immediate parent block for each node
  let parent1 = node1.parent;
  let parent2 = node2.parent;

  // Traverse up to find the containing block for each node
  while (
    parent1 &&
    parent1.type !== 'BlockStatement' &&
    parent1.type !== 'Program'
  ) {
    parent1 = parent1.parent;
  }

  while (
    parent2 &&
    parent2.type !== 'BlockStatement' &&
    parent2.type !== 'Program'
  ) {
    parent2 = parent2.parent;
  }

  return parent1 === parent2;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow logException() calls in the same block as throw statements',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null, // Not auto-fixable
    schema: [], // no options supported
    messages: {
      noLogExceptionWithThrow:
        'logException() or logError() should not be used in the same block as a throw statement as this leads to duplicate error reporting. Only perform one or the other.',
    },
  },
  create(context) {
    // Track logException/logError calls and throw statements
    const logExceptionCalls = [];
    const throwStatements = [];

    return {
      // Collect logException/logError calls
      CallExpression(node) {
        if (isLogExceptionCall(node)) {
          logExceptionCalls.push(node);
        }
      },

      // Collect throw statements
      ThrowStatement(node) {
        throwStatements.push(node);
      },

      // Report violations after traversal
      'Program:exit'() {
        // Compare each log call against each throw statement
        logExceptionCalls.forEach((logCall) => {
          throwStatements.forEach((throwStmt) => {
            if (areInSameBlock(logCall, throwStmt)) {
              context.report({
                node: logCall,
                messageId: 'noLogExceptionWithThrow',
              });
            }
          });
        });
      },
    };
  },
};
