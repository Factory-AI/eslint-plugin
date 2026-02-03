/**
 * @fileoverview Rule to enforce that filenames match their exported functions or React components
 * @author Factory Infrastructure Team
 */

'use strict';

const path = require('path');

/**
 * Check whether a function is a React component.
 * @param {import('eslint').Rule.Node} node - The function node
 * @returns {boolean} True if the function is a React component
 */
function isReactComponent(node) {
  // React components start with an uppercase letter
  if (node.type === 'FunctionDeclaration' && node.id) {
    const name = node.id.name;
    return name.charAt(0) === name.charAt(0).toUpperCase();
  }

  // Handle variable declarations with function expressions
  if (node.type === 'VariableDeclaration') {
    for (const declarator of node.declarations) {
      if (declarator.id && declarator.id.type === 'Identifier') {
        const name = declarator.id.name;
        if (name.charAt(0) === name.charAt(0).toUpperCase()) {
          // Ensure it's a function expression
          if (
            declarator.init &&
            (declarator.init.type === 'ArrowFunctionExpression' ||
              declarator.init.type === 'FunctionExpression')
          ) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Get the name of an exported function or component.
 * @param {import('eslint').Rule.Node} node - The export node
 * @returns {string|null} The exported name or null
 */
function getExportedName(node) {
  // Named export of function declaration: export function Foo() {}
  if (
    node.type === 'ExportNamedDeclaration' &&
    node.declaration &&
    node.declaration.type === 'FunctionDeclaration' &&
    node.declaration.id
  ) {
    return node.declaration.id.name;
  }

  // Named export of variable: export const Foo = () => {}
  if (
    node.type === 'ExportNamedDeclaration' &&
    node.declaration &&
    node.declaration.type === 'VariableDeclaration'
  ) {
    const declarator = node.declaration.declarations[0];
    if (declarator && declarator.id && declarator.id.type === 'Identifier') {
      return declarator.id.name;
    }
  }

  // Default export of function declaration: export default function Foo() {}
  if (
    node.type === 'ExportDefaultDeclaration' &&
    node.declaration &&
    node.declaration.type === 'FunctionDeclaration' &&
    node.declaration.id
  ) {
    return node.declaration.id.name;
  }

  // Default export of identifier: export default Foo
  if (
    node.type === 'ExportDefaultDeclaration' &&
    node.declaration &&
    node.declaration.type === 'Identifier'
  ) {
    return node.declaration.name;
  }

  return null;
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce that filenames match their exported React component or single exported function',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      filenameMismatch:
        'Filename "{{filename}}" should match the exported {{exportType}} name "{{exportedName}}". Expected "{{expectedFilename}}".',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoredFiles: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of file patterns to ignore',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename();
    const options = context.options[0] || {};
    const ignoredFiles = options.ignoredFiles || [
      'index.ts',
      'index.tsx',
      'index.js',
      'index.jsx',
    ];

    // Skip ignored files
    const basename = path.basename(filename);
    if (ignoredFiles.some((pattern) => basename === pattern)) {
      return {};
    }

    // Skip test and story files
    if (
      basename.includes('.test.') ||
      basename.includes('.spec.') ||
      basename.includes('.stories.')
    ) {
      return {};
    }

    const exports = [];
    const reactComponents = [];

    return {
      ExportNamedDeclaration(node) {
        const exportedName = getExportedName(node);
        if (exportedName) {
          exports.push({ name: exportedName, node });

          // Track React components
          if (node.declaration && isReactComponent(node.declaration)) {
            reactComponents.push({ name: exportedName, node });
          }
        }
      },

      ExportDefaultDeclaration(node) {
        const exportedName = getExportedName(node);
        if (exportedName) {
          exports.push({ name: exportedName, node });

          // Track React components
          if (node.declaration && isReactComponent(node.declaration)) {
            reactComponents.push({ name: exportedName, node });
          }
        }
      },

      'Program:exit'() {
        // If there are React components, validate filename matching
        if (reactComponents.length > 0) {
          const filenameWithoutExt = path
            .basename(filename, path.extname(filename))
            .replace(/\.(tsx|ts|jsx|js)$/, '');

          // Detect special file types
          const pageFileMatch = basename.match(/^(.+)\.page\.(tsx|ts|jsx|js)$/);
          const moduleFileMatch = basename.match(
            /^(.+)\.module\.(tsx|ts|jsx|js)$/
          );
          const layoutFileMatch = basename.match(
            /^(.+)\.layout\.(tsx|ts|jsx|js)$/
          );
          const viewFileMatch = basename.match(/^(.+)\.view\.(tsx|ts|jsx|js)$/);
          const providerFileMatch = basename.match(
            /^(.+)\.provider\.(tsx|ts|jsx|js)$/
          );

          let expectedComponentName;
          let matchingComponent;

          if (pageFileMatch) {
            // For *.page files, expect BaseName + "Page" (Sessions.page.tsx -> SessionsPage)
            const baseName = pageFileMatch[1];
            expectedComponentName = `${baseName}Page`;
            matchingComponent = reactComponents.find(
              (comp) => comp.name === expectedComponentName
            );
          } else if (moduleFileMatch) {
            // For *.module files, expect BaseName + "Module" (TerminalPane.module.tsx -> TerminalPaneModule)
            const baseName = moduleFileMatch[1];
            expectedComponentName = `${baseName}Module`;
            matchingComponent = reactComponents.find(
              (comp) => comp.name === expectedComponentName
            );
          } else if (layoutFileMatch) {
            // For *.layout files, expect BaseName + "Layout" (AppLayout.layout.tsx -> AppLayoutLayout)
            const baseName = layoutFileMatch[1];
            expectedComponentName = `${baseName}Layout`;
            matchingComponent = reactComponents.find(
              (comp) => comp.name === expectedComponentName
            );
          } else if (viewFileMatch) {
            // For *.view files, expect BaseName + "View" (LoadingView.view.tsx -> LoadingViewView)
            const baseName = viewFileMatch[1];
            expectedComponentName = `${baseName}View`;
            matchingComponent = reactComponents.find(
              (comp) => comp.name === expectedComponentName
            );
          } else if (providerFileMatch) {
            // For *.provider files, expect BaseName + "Provider" (AuthProvider.provider.tsx -> AuthProviderProvider)
            const baseName = providerFileMatch[1];
            expectedComponentName = `${baseName}Provider`;
            matchingComponent = reactComponents.find(
              (comp) => comp.name === expectedComponentName
            );
          } else {
            // For regular files, expect filename to match component name
            expectedComponentName = filenameWithoutExt;
            matchingComponent = reactComponents.find(
              (comp) => comp.name === filenameWithoutExt
            );

            // If the component has a special suffix, enforce the matching file type.
            if (matchingComponent) {
              if (matchingComponent.name.endsWith('Page')) {
                matchingComponent = null;
              } else if (matchingComponent.name.endsWith('Module')) {
                matchingComponent = null;
              } else if (matchingComponent.name.endsWith('Layout')) {
                matchingComponent = null;
              } else if (matchingComponent.name.endsWith('View')) {
                matchingComponent = null;
              } else if (matchingComponent.name.endsWith('Provider')) {
                matchingComponent = null;
              }
            }
          }

          if (!matchingComponent && reactComponents.length === 1) {
            const component = reactComponents[0];
            const ext = path.extname(filename);

            let expectedFilename;
            if (pageFileMatch) {
              // For .page files, suggest the correct filename if mismatched
              if (component.name.endsWith('Page')) {
                const baseName = component.name.slice(0, -4); // Remove "Page" suffix
                expectedFilename = `${baseName}.page${ext}`;
              } else {
                expectedFilename = `${component.name}${ext}`;
              }
            } else if (moduleFileMatch) {
              // For *.module files, suggest the correct filename
              if (component.name.endsWith('Module')) {
                const baseName = component.name.slice(0, -6); // Remove "Module" suffix
                expectedFilename = `${baseName}.module${ext}`;
              } else {
                expectedFilename = `${component.name}${ext}`;
              }
            } else if (layoutFileMatch) {
              // For *.layout files, suggest the correct filename
              if (component.name.endsWith('Layout')) {
                const baseName = component.name.slice(0, -6); // Remove "Layout" suffix
                expectedFilename = `${baseName}.layout${ext}`;
              } else {
                expectedFilename = `${component.name}${ext}`;
              }
            } else if (viewFileMatch) {
              // For *.view files, suggest the correct filename
              if (component.name.endsWith('View')) {
                const baseName = component.name.slice(0, -4); // Remove "View" suffix
                expectedFilename = `${baseName}.view${ext}`;
              } else {
                expectedFilename = `${component.name}${ext}`;
              }
            } else if (providerFileMatch) {
              // For *.provider files, suggest the correct filename
              if (component.name.endsWith('Provider')) {
                const baseName = component.name.slice(0, -8); // Remove "Provider" suffix
                expectedFilename = `${baseName}.provider${ext}`;
              } else {
                expectedFilename = `${component.name}${ext}`;
              }
            } else {
              // For regular files with special suffixes, suggest the correct format
              if (component.name.endsWith('Page')) {
                const baseName = component.name.slice(0, -4);
                expectedFilename = `${baseName}.page${ext}`;
              } else if (component.name.endsWith('Module')) {
                const baseName = component.name.slice(0, -6);
                expectedFilename = `${baseName}.module${ext}`;
              } else if (component.name.endsWith('Layout')) {
                const baseName = component.name.slice(0, -6);
                expectedFilename = `${baseName}.layout${ext}`;
              } else if (component.name.endsWith('View')) {
                const baseName = component.name.slice(0, -4);
                expectedFilename = `${baseName}.view${ext}`;
              } else if (component.name.endsWith('Provider')) {
                const baseName = component.name.slice(0, -8);
                expectedFilename = `${baseName}.provider${ext}`;
              } else {
                expectedFilename = `${component.name}${ext}`;
              }
            }

            context.report({
              node: component.node,
              messageId: 'filenameMismatch',
              data: {
                filename: basename,
                exportType: 'React component',
                exportedName: component.name,
                expectedFilename,
              },
            });
          }
        }
        // If there's exactly one exported function and it's not a React component
        else if (exports.length === 1) {
          const exportedItem = exports[0];
          const filenameWithoutExt = path
            .basename(filename, path.extname(filename))
            .replace(/\.(tsx|ts|jsx|js)$/, '');

          if (exportedItem.name !== filenameWithoutExt) {
            const ext = path.extname(filename);
            const expectedFilename = `${exportedItem.name}${ext}`;

            context.report({
              node: exportedItem.node,
              messageId: 'filenameMismatch',
              data: {
                filename: basename,
                exportType: 'function',
                exportedName: exportedItem.name,
                expectedFilename,
              },
            });
          }
        }
      },
    };
  },
};
