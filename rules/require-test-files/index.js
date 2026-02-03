/**
 * @fileoverview Rule to enforce that TypeScript files (.ts only, not .tsx) have corresponding test files
 * @author Factory Infrastructure Team
 */

'use strict';

const path = require('path');
const fs = require('fs');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that TypeScript files have corresponding test files',
      category: 'TypeScript',
      recommended: true,
    },
    messages: {
      missingTestFile:
        'TypeScript file "{{filename}}" is missing a corresponding test file "{{testFilename}}"',
    },
    schema: [], // no options supported
  },

  create(context) {
    const filename = context.getFilename();
    const basename = path.basename(filename);
    const dirname = path.dirname(filename);

    // Only check .ts files (exclude .tsx)
    if (!filename.endsWith('.ts')) {
      return {};
    }

    // Skip test files
    if (filename.endsWith('.test.ts')) {
      return {};
    }

    // Skip config files
    if (filename.endsWith('.config.ts')) {
      return {};
    }

    // Skip declaration files
    if (filename.endsWith('.d.ts')) {
      return {};
    }

    // Utility files that don't require tests
    const exemptFiles = [
      'enums.ts',
      'schema.ts',
      'types.ts',
      'constants.ts',
      'errors.ts',
      'index.ts',
      'env.ts',
      'config.ts',
      'route.ts',
    ];

    // Skip exempted utility files
    if (exemptFiles.includes(basename)) {
      return {};
    }

    // Skip hook files
    if (basename.startsWith('use')) {
      return {};
    }

    // Construct the expected test file name
    const testFilename = basename.replace(/\.(ts|tsx)$/, '.test.$1');
    const testFilePath = path.join(dirname, testFilename);

    return {
      'Program:exit'(node) {
        // Report when the test file is missing
        if (!fs.existsSync(testFilePath)) {
          context.report({
            node,
            messageId: 'missingTestFile',
            data: {
              filename: basename,
              testFilename: testFilename,
            },
          });
        }
      },
    };
  },
};
