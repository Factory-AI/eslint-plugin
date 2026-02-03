/**
 * @fileoverview Rule to enforce that all TypeScript enums must be in files named 'enums.ts'
 * and that 'enums.ts' files can only contain enum declarations and type exports with no imports
 * @author Factory Infrastructure Team
 */

'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce TypeScript enum organization',
      category: 'TypeScript',
      recommended: true,
    },
    messages: {
      enumInWrongFile:
        'TypeScript enums must be defined in a file named "enums.ts"',
      nonEnumInEnumFile:
        'Files named "enums.ts" can only contain enum declarations and type exports',
      importsInEnumFile:
        'Files named "enums.ts" cannot contain import statements',
    },
    schema: [], // no options supported
  },

  create(context) {
    const filename = context.getFilename();
    const isEnumFile =
      filename.endsWith('/enums.ts') || filename === 'enums.ts';
    const isTypeScriptFile =
      filename.endsWith('.ts') || filename.endsWith('.tsx');

    function isExported(node) {
      const parent = node.parent;
      return (
        parent &&
        (parent.type === 'ExportNamedDeclaration' ||
          parent.type === 'ExportDefaultDeclaration')
      );
    }

    // Skip non-TypeScript files
    if (!isTypeScriptFile) {
      return {};
    }

    return {
      // Flag enums declared outside enums.ts
      TSEnumDeclaration(node) {
        if (!isEnumFile && isExported(node)) {
          context.report({
            node,
            messageId: 'enumInWrongFile',
          });
        }
      },

      // Disallow imports in enums.ts
      ImportDeclaration(node) {
        if (isEnumFile) {
          context.report({
            node,
            messageId: 'importsInEnumFile',
          });
        }
      },

      // Disallow non-enum declarations in enums.ts
      Program(node) {
        if (isEnumFile) {
          // Only process enum files
          for (const statement of node.body) {
            // Allow enums, type aliases, and type exports
            const isEnum = statement.type === 'TSEnumDeclaration';
            const isTypeAlias = statement.type === 'TSTypeAliasDeclaration';
            const isInterfaceDeclaration =
              statement.type === 'TSInterfaceDeclaration';

            // Allow export statements that export types
            const isExportingTypes =
              statement.type === 'ExportNamedDeclaration' &&
              (statement.declaration === null ||
                statement.declaration.type === 'TSTypeAliasDeclaration' ||
                statement.declaration.type === 'TSInterfaceDeclaration' ||
                statement.declaration.type === 'TSEnumDeclaration');

            // Allow re-exports from the current file
            const isReExportFromCurrentFile =
              statement.type === 'ExportNamedDeclaration' &&
              !statement.source &&
              statement.specifiers &&
              statement.specifiers.length > 0;

            // Export-all declarations are not allowed
            const isExportAllDeclaration =
              statement.type === 'ExportAllDeclaration';

            if (
              !(
                isEnum ||
                isTypeAlias ||
                isInterfaceDeclaration ||
                isExportingTypes ||
                isReExportFromCurrentFile
              ) &&
              statement.type !== 'ImportDeclaration'
            ) {
              // Import declarations are handled separately

              // Skip export-all declarations (handled by ImportDeclaration)
              if (!isExportAllDeclaration) {
                context.report({
                  node: statement,
                  messageId: 'nonEnumInEnumFile',
                });
              }
            }
          }
        }
      },
    };
  },
};
