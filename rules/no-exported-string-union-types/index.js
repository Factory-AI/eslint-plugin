/**
 * @fileoverview Rule to enforce using enums instead of exported string union types
 * @author Factory Infrastructure Team
 */

'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow exported types that are unions of string literals; use enums instead',
      category: 'TypeScript',
      recommended: true,
    },
    messages: {
      useEnumInstead:
        'Exported string union types are not allowed. Define an enum in enums.ts instead.',
    },
    schema: [],
  },

  create(context) {
    function isStringLiteralType(node) {
      return (
        node.type === 'TSLiteralType' &&
        node.literal &&
        node.literal.type === 'Literal' &&
        typeof node.literal.value === 'string'
      );
    }

    function isStringUnionType(typeAnnotation) {
      if (!typeAnnotation) return false;

      if (typeAnnotation.type === 'TSUnionType') {
        const types = typeAnnotation.types;
        // Require all union members to be string literals
        return types.length > 0 && types.every((t) => isStringLiteralType(t));
      }

      return false;
    }

    return {
      TSTypeAliasDeclaration(node) {
        const parent = node.parent;
        const isExported =
          parent &&
          (parent.type === 'ExportNamedDeclaration' ||
            parent.type === 'ExportDefaultDeclaration');

        if (isExported && isStringUnionType(node.typeAnnotation)) {
          context.report({
            node,
            messageId: 'useEnumInstead',
          });
        }
      },
    };
  },
};
