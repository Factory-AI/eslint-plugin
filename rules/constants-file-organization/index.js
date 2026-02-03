/**
 * @fileoverview Rule to enforce that all exported constants must be in files named 'constants.ts'
 * and that 'constants.ts' files can only contain const declarations, while their imports are limited
 * to external modules or internal files named 'enums.ts', 'types.ts', or 'schema.ts'.
 * @author Factory Infrastructure Team
 */

'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce constants file organization',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      constInWrongFile:
        'Exported constants must be defined in a file named "constants.ts"',
      nonConstInConstantsFile:
        'Files named "constants.ts" can only contain const declarations',
      invalidImportInConstantsFile:
        'Files named "constants.ts" can only import external modules or files named "constants.ts", "enums.ts", "types.ts", or "schema.ts"',
    },
    schema: [], // no options supported
  },

  create(context) {
    const filename = context.getFilename();
    const isConstantsFile =
      filename.endsWith('/constants.ts') ||
      filename.endsWith('/constants.tsx') ||
      filename === 'constants.ts' ||
      filename === 'constants.tsx';

    // Check whether an import is allowed in constants files
    function isValidImportForConstantsFile(importPath) {
      // External module imports (not relative or internal)
      const isExternal =
        !importPath.startsWith('.') &&
        !importPath.startsWith('/') &&
        !importPath.startsWith('@/');

      if (isExternal) {
        return true;
      }

      // Allow media imports (images/video/audio)
      const mediaExtensions = [
        '.mp4',
        '.webm',
        '.ogg',
        '.mp3',
        '.wav',
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.svg',
        '.webp',
      ];
      if (mediaExtensions.some((ext) => importPath.endsWith(ext))) {
        return true;
      }

      // Allow internal constants, enums, types, and schema modules
      return (
        importPath.endsWith('/constants') ||
        importPath.endsWith('/constants.ts') ||
        importPath === 'constants' ||
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

    // Check whether a node is exported
    function isExported(node) {
      const parent = node.parent;
      return (
        parent &&
        (parent.type === 'ExportNamedDeclaration' ||
          parent.type === 'ExportDefaultDeclaration')
      );
    }

    // Check whether a variable declaration is const
    function isConstDeclaration(node) {
      return node.type === 'VariableDeclaration' && node.kind === 'const';
    }

    // Check whether an initializer is a call/new/tagged-template expression
    function isCallExpression(declarator) {
      return (
        declarator.init &&
        (declarator.init.type === 'CallExpression' ||
          declarator.init.type === 'NewExpression' ||
          declarator.init.type === 'TaggedTemplateExpression')
      );
    }

    return {
      // Flag exported consts outside constants files
      VariableDeclaration(node) {
        if (node.kind === 'const' && isExported(node) && !isConstantsFile) {
          // Ignore consts initialized by call/new/tagged-template expressions
          const hasCallExpression = node.declarations.some(isCallExpression);

          // Allow call/new/tagged-template initializers
          if (!hasCallExpression) {
            context.report({
              node,
              messageId: 'constInWrongFile',
            });
          }
        }
      },

      // Validate imports inside constants files
      ImportDeclaration(node) {
        if (isConstantsFile && node.source && node.source.value) {
          const importPath = node.source.value;
          if (!isValidImportForConstantsFile(importPath)) {
            context.report({
              node,
              messageId: 'invalidImportInConstantsFile',
            });
          }
        }
      },

      // Disallow non-const declarations in constants files
      Program(node) {
        if (isConstantsFile) {
          for (const statement of node.body) {
            // Allow imports
            const isImport = statement.type === 'ImportDeclaration';

            // Allow const declarations
            const isConst = isConstDeclaration(statement);

            // Allow exported consts
            const isExportedConst =
              statement.type === 'ExportNamedDeclaration' &&
              statement.declaration &&
              isConstDeclaration(statement.declaration);

            // Allow re-exports
            const isReExport =
              statement.type === 'ExportNamedDeclaration' &&
              !statement.declaration &&
              statement.specifiers &&
              statement.specifiers.length > 0;

            // Allow export-all from valid sources
            const isExportAll =
              statement.type === 'ExportAllDeclaration' &&
              statement.source &&
              isValidImportForConstantsFile(statement.source.value);

            // Allow type-only imports
            const isTypeImport =
              statement.type === 'ImportDeclaration' &&
              statement.importKind === 'type';

            if (
              !(
                isImport ||
                isConst ||
                isExportedConst ||
                isReExport ||
                isExportAll ||
                isTypeImport
              )
            ) {
              // Report non-const declarations (functions/classes/enums/types/interfaces)
              if (
                statement.type === 'FunctionDeclaration' ||
                statement.type === 'ClassDeclaration' ||
                statement.type === 'TSEnumDeclaration' ||
                statement.type === 'TSTypeAliasDeclaration' ||
                statement.type === 'TSInterfaceDeclaration' ||
                (statement.type === 'ExportNamedDeclaration' &&
                  statement.declaration &&
                  (statement.declaration.type === 'FunctionDeclaration' ||
                    statement.declaration.type === 'ClassDeclaration' ||
                    statement.declaration.type === 'TSEnumDeclaration' ||
                    statement.declaration.type === 'TSTypeAliasDeclaration' ||
                    statement.declaration.type === 'TSInterfaceDeclaration'))
              ) {
                context.report({
                  node: statement,
                  messageId: 'nonConstInConstantsFile',
                });
              }
              // Report let/var declarations
              else if (
                statement.type === 'VariableDeclaration' &&
                statement.kind !== 'const'
              ) {
                context.report({
                  node: statement,
                  messageId: 'nonConstInConstantsFile',
                });
              }
              // Report exported let/var declarations
              else if (
                statement.type === 'ExportNamedDeclaration' &&
                statement.declaration &&
                statement.declaration.type === 'VariableDeclaration' &&
                statement.declaration.kind !== 'const'
              ) {
                context.report({
                  node: statement,
                  messageId: 'nonConstInConstantsFile',
                });
              }
            }
          }
        }
      },
    };
  },
};
