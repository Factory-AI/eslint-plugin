/**
 * @fileoverview Rule to enforce that all classes extending Error must be in files named 'errors.ts'
 * and that 'errors.ts' files can only contain Error classes, while their imports are limited
 * to external modules or internal files named 'enums.ts', 'types.ts', 'constants.ts', or 'errors.ts'.
 * @author Factory Infrastructure Team
 */

'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce Error classes organization',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      errorClassInWrongFile:
        'Classes extending Error must be defined in a file named "errors.ts"',
      nonErrorInErrorsFile:
        'Files named "errors.ts" can only contain Error classes',
      invalidImportInErrorsFile:
        'Files named "errors.ts" can only import external modules or files named "enums.ts", "types.ts", "constants.ts", or "errors.ts"',
    },
    schema: [], // no options supported
  },

  create(context) {
    const filename = context.getFilename();
    const isErrorsFile =
      filename.endsWith('/errors.ts') ||
      filename.endsWith('/errors.tsx') ||
      filename === 'errors.ts' ||
      filename === 'errors.tsx';

    // Check whether an import is allowed in errors files
    function isValidImportForErrorsFile(importPath) {
      // External module imports (not relative or internal)
      const isExternal =
        !importPath.startsWith('.') &&
        !importPath.startsWith('/') &&
        !importPath.startsWith('@/');

      if (isExternal) {
        return true;
      }

      // Allow internal enums, types, constants, and errors modules
      return (
        importPath.endsWith('/enums') ||
        importPath.endsWith('/enums.ts') ||
        importPath === 'enums' ||
        importPath.endsWith('/types') ||
        importPath.endsWith('/types.ts') ||
        importPath === 'types' ||
        importPath.endsWith('/constants') ||
        importPath.endsWith('/constants.ts') ||
        importPath === 'constants' ||
        importPath.endsWith('/errors') ||
        importPath.endsWith('/errors.ts') ||
        importPath === 'errors'
      );
    }

    // Check whether a class extends Error
    function extendsError(node) {
      if (!node.superClass) {
        return false;
      }

      // Direct Error inheritance
      if (node.superClass.type === 'Identifier') {
        const superClassName = node.superClass.name;
        return superClassName === 'Error' || superClassName.includes('Error');
      }

      // Member expression (e.g., Something.Error)
      if (node.superClass.type === 'MemberExpression') {
        if (
          node.superClass.property &&
          node.superClass.property.type === 'Identifier'
        ) {
          const propertyName = node.superClass.property.name;
          return propertyName === 'Error' || propertyName.includes('Error');
        }
      }

      return false;
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

    // Check whether a declaration is an Error class
    function isErrorClass(node) {
      return node.type === 'ClassDeclaration' && extendsError(node);
    }

    return {
      // Flag Error classes outside errors files
      ClassDeclaration(node) {
        if (extendsError(node) && !isErrorsFile) {
          // Only report exported Error classes
          if (isExported(node)) {
            context.report({
              node,
              messageId: 'errorClassInWrongFile',
            });
          }
        }
      },

      // Validate imports inside errors files
      ImportDeclaration(node) {
        if (isErrorsFile && node.source && node.source.value) {
          const importPath = node.source.value;
          if (!isValidImportForErrorsFile(importPath)) {
            context.report({
              node,
              messageId: 'invalidImportInErrorsFile',
            });
          }
        }
      },

      // Disallow non-Error declarations in errors files
      Program(node) {
        if (isErrorsFile) {
          for (const statement of node.body) {
            // Allow imports
            const isImport = statement.type === 'ImportDeclaration';

            // Allow Error class declarations
            const isError = isErrorClass(statement);

            // Allow exported Error classes
            const isExportedError =
              statement.type === 'ExportNamedDeclaration' &&
              statement.declaration &&
              isErrorClass(statement.declaration);

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
              isValidImportForErrorsFile(statement.source.value);

            // Allow type-only imports
            const isTypeImport =
              statement.type === 'ImportDeclaration' &&
              statement.importKind === 'type';

            if (
              !(
                isImport ||
                isError ||
                isExportedError ||
                isReExport ||
                isExportAll ||
                isTypeImport
              )
            ) {
              // Report any non-Error declaration
              if (
                statement.type === 'FunctionDeclaration' ||
                statement.type === 'VariableDeclaration' ||
                statement.type === 'TSEnumDeclaration' ||
                statement.type === 'TSTypeAliasDeclaration' ||
                statement.type === 'TSInterfaceDeclaration' ||
                (statement.type === 'ClassDeclaration' &&
                  !extendsError(statement)) ||
                (statement.type === 'ExportNamedDeclaration' &&
                  statement.declaration &&
                  (statement.declaration.type === 'FunctionDeclaration' ||
                    statement.declaration.type === 'VariableDeclaration' ||
                    statement.declaration.type === 'TSEnumDeclaration' ||
                    statement.declaration.type === 'TSTypeAliasDeclaration' ||
                    statement.declaration.type === 'TSInterfaceDeclaration' ||
                    (statement.declaration.type === 'ClassDeclaration' &&
                      !extendsError(statement.declaration))))
              ) {
                context.report({
                  node: statement,
                  messageId: 'nonErrorInErrorsFile',
                });
              }
            }
          }
        }
      },
    };
  },
};
