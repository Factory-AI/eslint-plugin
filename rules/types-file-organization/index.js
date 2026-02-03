/**
 * @fileoverview Rule to enforce that all TypeScript types and interfaces must be in files named 'types.ts'
 * and that 'types.ts' files can only contain type and interface declarations, while their imports are limited
 * to external modules or internal enum files.
 * @author Factory Infrastructure Team
 */

'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce TypeScript types and interfaces organization',
      category: 'TypeScript',
      recommended: true,
    },
    messages: {
      typeInWrongFile:
        'TypeScript types and interfaces must be defined in a file named "types.ts"',
      nonTypeInTypeFile:
        'Files named "types.ts" can only contain type aliases and interface declarations',
      invalidImportInTypeFile:
        'Files named "types.ts" can only import external modules or enum files',
    },
    schema: [], // no options supported
  },

  create(context) {
    const filename = context.getFilename();
    const isTypeFile =
      filename.endsWith('/types.ts') || filename === 'types.ts';

    // Check whether an import is allowed in types files
    function isValidImportForTypeFile(importPath) {
      // External module imports (not relative or internal)
      const isExternal =
        !importPath.startsWith('.') &&
        !importPath.startsWith('/') &&
        !importPath.startsWith('@/');

      if (isExternal) {
        return true;
      }

      // Allow internal enum/type/schema files
      return (
        importPath.endsWith('/enums') ||
        importPath.endsWith('/enums.ts') ||
        importPath === 'enums' ||
        importPath.endsWith('/types') ||
        importPath.endsWith('/types.ts') ||
        importPath === 'types' ||
        importPath.endsWith('/schema') ||
        importPath.endsWith('/schema.ts') ||
        importPath === 'schema'
      );
    }

    return {
      // Flag exported type aliases outside types.ts
      TSTypeAliasDeclaration(node) {
        // Only check exported types
        const parent = node.parent;
        const isExported =
          parent &&
          (parent.type === 'ExportNamedDeclaration' ||
            parent.type === 'ExportDefaultDeclaration' ||
            (parent.type === 'TSModuleBlock' &&
              parent.parent &&
              parent.parent.parent &&
              parent.parent.parent.type === 'ExportNamedDeclaration'));

        if (isExported && !isTypeFile) {
          context.report({
            node,
            messageId: 'typeInWrongFile',
          });
        }
      },

      // Flag exported interfaces outside types.ts
      TSInterfaceDeclaration(node) {
        // Only check exported interfaces
        const parent = node.parent;
        const isExported =
          parent &&
          (parent.type === 'ExportNamedDeclaration' ||
            parent.type === 'ExportDefaultDeclaration' ||
            (parent.type === 'TSModuleBlock' &&
              parent.parent &&
              parent.parent.parent &&
              parent.parent.parent.type === 'ExportNamedDeclaration'));

        if (isExported && !isTypeFile) {
          context.report({
            node,
            messageId: 'typeInWrongFile',
          });
        }
      },

      // Validate imports in types.ts
      ImportDeclaration(node) {
        if (
          isTypeFile &&
          node.source &&
          node.source.value &&
          node.importKind !== 'type'
        ) {
          const importPath = node.source.value;
          if (!isValidImportForTypeFile(importPath)) {
            context.report({
              node,
              messageId: 'invalidImportInTypeFile',
            });
          }
        }
      },

      // Disallow non-type declarations in types.ts
      Program(node) {
        if (isTypeFile) {
          // Only process types.ts files
          for (const statement of node.body) {
            // Allow type aliases, interfaces, and type exports
            const isTypeAlias =
              statement.type === 'TSTypeAliasDeclaration' ||
              (statement.type === 'ExportNamedDeclaration' &&
                statement.declaration &&
                statement.declaration.type === 'TSTypeAliasDeclaration');

            const isInterface =
              statement.type === 'TSInterfaceDeclaration' ||
              (statement.type === 'ExportNamedDeclaration' &&
                statement.declaration &&
                statement.declaration.type === 'TSInterfaceDeclaration');

            // Allow export statements that export types
            const isExportingTypes =
              statement.type === 'ExportNamedDeclaration' &&
              (statement.declaration === null ||
                statement.declaration.type === 'TSTypeAliasDeclaration' ||
                statement.declaration.type === 'TSInterfaceDeclaration');

            // Allow re-exports from the current file
            const isReExportFromCurrentFile =
              statement.type === 'ExportNamedDeclaration' &&
              !statement.source &&
              statement.specifiers &&
              statement.specifiers.length > 0;

            // Export-all declarations are not allowed
            const isExportAllDeclaration =
              statement.type === 'ExportAllDeclaration';

            // Allow import declarations from enum/type/schema files (checked separately)
            const isImport = statement.type === 'ImportDeclaration';

            if (
              !(
                isTypeAlias ||
                isInterface ||
                isExportingTypes ||
                isReExportFromCurrentFile ||
                isImport
              )
            ) {
              // Skip export-all declarations (handled by ImportDeclaration)
              if (!isExportAllDeclaration) {
                context.report({
                  node: statement,
                  messageId: 'nonTypeInTypeFile',
                });
              }
            }
          }
        }
      },
    };
  },
};
