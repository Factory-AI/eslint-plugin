/**
 * @fileoverview Rule to enforce test file location and organization
 * @author Factory Infrastructure Team
 */

'use strict';

const path = require('path');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce test file location and organization',
      category: 'TypeScript',
      recommended: true,
    },
    messages: {
      testFileWrongNaming:
        'Test file should follow naming convention: filename.test.ts',
      testFileInWrongLocation: `Test files should be in the same directory as the file they test, not in a 'test' or '__tests__' directory.`,
      testFileMissingTests:
        'Test file should contain at least one test or describe block',
    },
    schema: [], // no options supported
  },

  create(context) {
    const filename = context.getFilename();
    const isTestFile = filename.includes('.test.');
    const isTypeScriptFile =
      filename.endsWith('.ts') || filename.endsWith('.tsx');

    // Skip non-TypeScript files and non-test files
    if (!isTypeScriptFile || !isTestFile) {
      return {};
    }

    // Extract the base name and directory
    const dirname = path.dirname(filename);
    const basename = path.basename(filename);

    // Track whether any test blocks are present
    let hasTestBlocks = false;

    // Check whether a node is a test block
    function isTestBlock(node) {
      // Match describe/it/test and common test helpers
      if (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier'
      ) {
        const name = node.callee.name;
        return [
          'describe',
          'it',
          'test',
          'beforeEach',
          'afterEach',
          'beforeAll',
          'afterAll',
          'expect',
          'jest',
          'vitest',
          'cy',
          'assert',
          'should',
          'mock',
        ].includes(name);
      }

      return false;
    }

    return {
      // Track test blocks as we traverse
      CallExpression(node) {
        if (isTestBlock(node)) {
          hasTestBlocks = true;
        }
      },

      // Final checks after traversal
      'Program:exit'(node) {
        // Enforce naming convention
        if (!basename.match(/^.+\.test\.(ts|tsx)$/)) {
          context.report({
            node,
            messageId: 'testFileWrongNaming',
          });
        }

        // Ensure tests are colocated (not under test/__tests__)
        // Split the directory path and check for test/__tests__ segments
        const dirSegments = dirname.split(path.sep);
        const isInTestDirectory = dirSegments.some(
          (segment) => segment === 'test' || segment === '__tests__'
        );

        if (basename.includes('.test.') && isInTestDirectory) {
          context.report({
            node,
            messageId: 'testFileInWrongLocation',
            data: {
              dirname,
              testFile: basename,
            },
          });
        }

        // Ensure the test file contains test blocks
        if (!hasTestBlocks) {
          context.report({
            node,
            messageId: 'testFileMissingTests',
          });
        }
      },
    };
  },
};
