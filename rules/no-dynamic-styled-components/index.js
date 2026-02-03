/**
 * @fileoverview Disallow creating styled-components inside functions (require module scope)
 */

'use strict';

/**
 * Determine whether a node is inside a function-like scope.
 * @param {import('eslint').Rule.Node[]} ancestors
 * @returns {boolean}
 */
function isInsideFunction(ancestors) {
  return ancestors.some((a) =>
    [
      'FunctionDeclaration',
      'FunctionExpression',
      'ArrowFunctionExpression',
      'MethodDefinition',
      'Property',
      'PropertyDefinition', // TS class field
    ].includes(a.type)
  );
}

/**
 * Find the base identifier for a chained MemberExpression/CallExpression.
 * e.g. styled.div.withConfig(...), styled(Component).attrs(...)
 * @param {import('estree').Expression} node
 * @returns {string | null}
 */
function getBaseIdentifierName(node) {
  let current = node;
  // Walk through MemberExpression/CallExpression to find the left-most identifier.
  // Handles: styled.div`...`, styled(Component)`...`, styled.div.attrs(... )`...`, styled(Component).attrs(... )`...`
  while (current) {
    if (current.type === 'Identifier') return current.name;
    if (current.type === 'MemberExpression') {
      // @ts-ignore
      current = current.object;
      continue;
    }
    if (current.type === 'CallExpression') {
      // @ts-ignore
      current = current.callee;
      continue;
    }
    break;
  }
  return null;
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow creating styled-components inside functions/components (must be module-scoped)',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noDynamicStyled:
        'Do not create styled-components inside functions/components. Hoist styled component definitions to module scope to avoid runtime re-creation and test warnings.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    const base = filename.split('/').pop() || '';
    // Ignore tests and stories by default
    if (
      base.includes('.test.') ||
      base.includes('.spec.') ||
      base.includes('.stories.')
    ) {
      return {};
    }

    // Track identifiers imported from styled-components
    const styledNames = new Set();

    return {
      ImportDeclaration(node) {
        if (node.source && node.source.value === 'styled-components') {
          for (const spec of node.specifiers) {
            if (spec.type === 'ImportDefaultSpecifier') {
              styledNames.add(spec.local.name);
            }
            // Support namespace imports: import * as styled from 'styled-components'
            if (spec.type === 'ImportNamespaceSpecifier') {
              styledNames.add(spec.local.name);
            }
          }
        }
      },

      TaggedTemplateExpression(node) {
        if (styledNames.size === 0) return;
        const styledId = getBaseIdentifierName(node.tag);
        if (styledId && styledNames.has(styledId)) {
          const sourceCode = context.getSourceCode();
          const ancestors = sourceCode.getAncestors(node);
          if (isInsideFunction(ancestors)) {
            context.report({ node, messageId: 'noDynamicStyled' });
          }
        }
      },
    };
  },
};
