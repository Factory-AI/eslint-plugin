/**
 * @fileoverview Rule to enforce that TS/TSX files have corresponding test files (and stories for TSX)
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
        'Enforce that TS files have corresponding test files and TSX files have corresponding test and stories files',
      category: 'Testing',
      recommended: true,
    },
    messages: {
      missingTestFile:
        '{{fileType}} file "{{filename}}" is missing a corresponding test file "{{testFilename}}"',
      missingStoriesFile:
        'TSX file "{{filename}}" is missing a corresponding stories file "{{storiesFilename}}"',
    },
    schema: [], // no options supported
  },

  create(context) {
    const filename = context.getFilename();
    const basename = path.basename(filename);
    const dirname = path.dirname(filename);

    // Only check TS and TSX files
    const isTsxFile = filename.endsWith('.tsx');
    const isTsFile = filename.endsWith('.ts');

    if (!isTsFile && !isTsxFile) {
      return {};
    }

    // Skip test files
    if (filename.endsWith('.test.ts') || filename.endsWith('.test.tsx')) {
      return {};
    }

    // Skip stories files
    if (filename.endsWith('.stories.tsx')) {
      return {};
    }

    // Skip type definition files
    if (filename.endsWith('.d.ts')) {
      return {};
    }

    // Files that don't require tests/stories
    const exemptFiles = [
      'index.tsx',
      'index.ts',
      'layout.tsx',
      'page.tsx', // Next.js App Router files
      'loading.tsx',
      'error.tsx',
      'not-found.tsx',
      'template.tsx',
      'default.tsx',
      'types.ts',
      'types.tsx',
      'constants.ts',
      'constants.tsx',
      'enums.ts',
      'enums.tsx',
    ];

    // Skip exempted files
    if (exemptFiles.includes(basename)) {
      return {};
    }

    // Skip common definition files (style-props, config, etc.)
    const exemptPatterns = [
      /^style-props\.(ts|tsx)$/,
      /^config\.(ts|tsx)$/,
      /^schema\.(ts|tsx)$/,
    ];

    if (exemptPatterns.some((pattern) => pattern.test(basename))) {
      return {};
    }

    // Construct the expected test file name
    const extension = isTsxFile ? '.tsx' : '.ts';
    const testFilename = basename.replace(
      new RegExp(`\\${extension}$`),
      `.test${extension}`
    );
    const testFilePath = path.join(dirname, testFilename);

    // Construct the expected stories file name (TSX only)
    let storiesFilename, storiesFilePath;
    if (isTsxFile) {
      storiesFilename = basename.replace(/\.tsx$/, '.stories.tsx');
      storiesFilePath = path.join(dirname, storiesFilename);
    }

    return {
      'Program:exit'(node) {
        const missingTestFile = !fs.existsSync(testFilePath);

        // Report missing test file
        if (missingTestFile) {
          context.report({
            node,
            messageId: 'missingTestFile',
            data: {
              fileType: isTsxFile ? 'TSX' : 'TS',
              filename: basename,
              testFilename: testFilename,
            },
          });
        }

        // Report missing stories file (TSX only)
        if (isTsxFile) {
          const missingStoriesFile = !fs.existsSync(storiesFilePath);
          if (missingStoriesFile) {
            context.report({
              node,
              messageId: 'missingStoriesFile',
              data: {
                filename: basename,
                storiesFilename: storiesFilename,
              },
            });
          }
        }
      },
    };
  },
};
