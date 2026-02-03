/**
 * @fileoverview Rule to disallow wrapping text in plain HTML elements like span, div, p, etc.
 * @author Factory Infrastructure Team
 */

'use strict';

// HTML elements that should not wrap plain text directly
const RESTRICTED_ELEMENTS = [
  'div',
  'span',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'section',
  'article',
  'aside',
  'header',
  'footer',
  'main',
  'nav',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'small',
  'mark',
  'del',
  'ins',
  'sub',
  'sup',
  'blockquote',
  'cite',
  'q',
  'code',
  'pre',
  'kbd',
  'samp',
  'var',
  'time',
  'address',
  'abbr',
  'dfn',
  'label',
  'legend',
  'caption',
  'th',
  'td',
  'li',
  'dt',
  'dd',
  'figcaption',
  'summary',
];

/**
 * Check whether a JSX element contains direct text children.
 * @param {import('eslint').Rule.Node} node - The JSX element node
 * @returns {boolean} True if the element contains text
 */
function hasTextChildren(node) {
  if (!node.children || node.children.length === 0) {
    return false;
  }

  return node.children.some((child) => {
    if (child.type === 'JSXText') {
      // Ignore pure whitespace
      const text = child.value.trim();
      return text.length > 0;
    }
    if (child.type === 'JSXExpressionContainer' && child.expression) {
      // Skip null/undefined/boolean literals
      if (child.expression.type === 'Literal') {
        if (typeof child.expression.value === 'string') {
          return child.expression.value.trim().length > 0;
        }
        // Non-string literals are not treated as text
        return false;
      }
      // Skip empty expressions
      if (child.expression.type === 'JSXEmptyExpression') {
        return false;
      }
      // Treat template literals as text
      if (child.expression.type === 'TemplateLiteral') {
        return true;
      }
      // Treat string concatenation as text
      if (
        child.expression.type === 'BinaryExpression' &&
        child.expression.operator === '+'
      ) {
        return true;
      }
      // Treat conditional expressions as text
      if (child.expression.type === 'ConditionalExpression') {
        return true;
      }
      // Treat identifiers as text
      if (child.expression.type === 'Identifier') {
        // Skip known non-text identifiers
        const nonTextIdentifiers = ['null', 'undefined'];
        if (nonTextIdentifiers.includes(child.expression.name)) {
          return false;
        }
        return true;
      }
      // Treat member expressions (e.g., props.text) as text
      if (child.expression.type === 'MemberExpression') {
        return true;
      }
    }
    return false;
  });
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow wrapping text in plain HTML elements',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noPlainHtml:
        'Do not wrap text in plain HTML element <{{element}}>. Use a <Text> or <Header> component instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedElements: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Array of HTML element names that are allowed to wrap text',
          },
          customMessage: {
            type: 'string',
            description: 'Custom error message to display',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedElements = new Set(options.allowedElements || []);
    const customMessage = options.customMessage;

    return {
      JSXOpeningElement(node) {
        // Only check JSXIdentifier elements (not Component.SubComponent)
        if (node.name.type !== 'JSXIdentifier') {
          return;
        }

        const elementName = node.name.name;

        // Skip React components (start with uppercase)
        if (elementName[0] === elementName[0].toUpperCase()) {
          return;
        }

        // Skip explicitly allowed elements
        if (allowedElements.has(elementName)) {
          return;
        }

        // Only enforce on restricted elements
        if (RESTRICTED_ELEMENTS.includes(elementName)) {
          // Inspect the parent JSXElement for text children
          const jsxElement = node.parent;
          if (
            jsxElement &&
            jsxElement.type === 'JSXElement' &&
            hasTextChildren(jsxElement)
          ) {
            context.report({
              node,
              messageId: customMessage ? undefined : 'noPlainHtml',
              message: customMessage,
              data: { element: elementName },
            });
          }
        }
      },
    };
  },
};
