/**
 * @fileoverview Rule to enforce that TSX component declarations must be in files ending in .page.tsx, .module.tsx, .layout.tsx, .view.tsx, or .provider.tsx, or be in the allowlist
 * @author Factory Infrastructure Team
 */

'use strict';

const path = require('path');

/**
 * Check whether the current file is an allowed file type.
 * @param {string} filename - File path
 * @returns {boolean} True if the file ends with .page.tsx, .module.tsx, .layout.tsx, .view.tsx, .provider.tsx, or their .ts equivalents
 */
function isAllowedFile(filename) {
  return (
    filename.endsWith('.page.tsx') ||
    filename.endsWith('.page.ts') ||
    filename.endsWith('.module.tsx') ||
    filename.endsWith('.module.ts') ||
    filename.endsWith('.layout.tsx') ||
    filename.endsWith('.layout.ts') ||
    filename.endsWith('.view.tsx') ||
    filename.endsWith('.view.ts') ||
    filename.endsWith('.provider.tsx') ||
    filename.endsWith('.provider.ts')
  );
}

/**
 * Check whether a node is a React component declaration.
 * @param {import('eslint').Rule.Node} node - The node to check
 * @returns {boolean} True if it's a React component
 */
function isReactComponent(node) {
  // Components must start with an uppercase letter
  if (node.type === 'FunctionDeclaration' && node.id) {
    const name = node.id.name;
    return name.charAt(0) === name.charAt(0).toUpperCase();
  }

  if (
    node.type === 'VariableDeclarator' &&
    node.id &&
    node.id.type === 'Identifier'
  ) {
    const name = node.id.name;
    return name.charAt(0) === name.charAt(0).toUpperCase();
  }

  return false;
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce that TSX component declarations must be in files ending in .page.tsx, .module.tsx, .layout.tsx, .view.tsx, or .provider.tsx, or be in the allowlist',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      restrictedComponent:
        'Component "{{componentName}}" cannot be declared in this file. Components must be declared in files ending in .page.tsx, .module.tsx, .layout.tsx, .view.tsx, or .provider.tsx, or the component name must be in the allowlist.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowlist: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Array of component names that are allowed to be declared in any file',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename();
    const options = context.options[0] || {};
    const allowlist = new Set(options.allowlist || []);

    // Skip allowed file types
    if (isAllowedFile(filename)) {
      return {};
    }

    // Skip test and story files
    const basename = path.basename(filename);
    if (
      basename.includes('.test.') ||
      basename.includes('.spec.') ||
      basename.includes('.stories.')
    ) {
      return {};
    }

    // Only process TSX files
    if (!filename.endsWith('.tsx')) {
      return {};
    }

    return {
      // Check exported function declarations: export function MyComponent() {}
      'ExportNamedDeclaration > FunctionDeclaration'(node) {
        if (isReactComponent(node)) {
          const componentName = node.id.name;
          if (!allowlist.has(componentName)) {
            context.report({
              node: node.id,
              messageId: 'restrictedComponent',
              data: { componentName },
            });
          }
        }
      },

      // Check exported variable declarations: export const MyComponent = () => {}
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(
        node
      ) {
        if (isReactComponent(node)) {
          const componentName = node.id.name;
          if (!allowlist.has(componentName)) {
            context.report({
              node: node.id,
              messageId: 'restrictedComponent',
              data: { componentName },
            });
          }
        }
      },

      // Check default exports: export default function MyComponent() {}
      'ExportDefaultDeclaration > FunctionDeclaration'(node) {
        if (node.id && isReactComponent(node)) {
          const componentName = node.id.name;
          if (!allowlist.has(componentName)) {
            context.report({
              node: node.id,
              messageId: 'restrictedComponent',
              data: { componentName },
            });
          }
        }
      },

      // Check default exports of identifiers: const MyComponent = () => {}; export default MyComponent;
      'ExportDefaultDeclaration > Identifier'(node) {
        const componentName = node.name;
        // Enforce uppercase component naming
        if (componentName.charAt(0) === componentName.charAt(0).toUpperCase()) {
          if (!allowlist.has(componentName)) {
            context.report({
              node,
              messageId: 'restrictedComponent',
              data: { componentName },
            });
          }
        }
      },
    };
  },
};
