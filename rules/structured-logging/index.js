/**
 * @fileoverview ESLint rules to enforce structured logging patterns
 * @author Factory Infrastructure Team
 */
'use strict';

// Logging functions that should use structured format
const LOGGING_FUNCTIONS = ['logError', 'logException', 'logInfo', 'logWarn'];

/**
 * Check whether a node is a template literal with expressions.
 * @param {object} node - The AST node to check
 * @returns {boolean} True if the node is a template literal with expressions
 */
function isTemplateWithExpressions(node) {
  return (
    node.type === 'TemplateLiteral' &&
    node.expressions &&
    node.expressions.length > 0
  );
}

/**
 * Check whether a node is a binary expression using + for string concatenation.
 * @param {object} node - The AST node to check
 * @returns {boolean} True if the node is a string concatenation
 */
function isStringConcatenation(node) {
  return (
    node.type === 'BinaryExpression' &&
    node.operator === '+' &&
    (node.left.type === 'Literal' ||
      node.left.type === 'TemplateLiteral' ||
      node.left.type === 'BinaryExpression' ||
      (node.left.type === 'Identifier' && typeof node.left.name === 'string'))
  );
}

/**
 * Extract static parts and expressions from a template literal.
 * @param {object} node - The template literal node
 * @param {object} sourceCode - The ESLint source code object
 * @returns {object} Object containing staticParts and expressions
 */
function extractTemplatePartsAndExpressions(node, sourceCode) {
  const staticParts = [];
  const expressions = [];

  // For template literals, extract static parts and expressions
  if (node.type === 'TemplateLiteral') {
    for (let i = 0; i < node.quasis.length; i++) {
      staticParts.push(node.quasis[i].value.raw);

      if (i < node.expressions.length) {
        const expr = node.expressions[i];
        expressions.push({
          text: sourceCode.getText(expr),
          node: expr,
        });
      }
    }

    return { staticParts, expressions };
  }

  // For string concatenation, handle string-literal prefixes specially
  if (isStringConcatenation(node)) {
    if (node.left.type === 'Literal' && typeof node.left.value === 'string') {
      // Use the string literal as the static message
      staticParts.push(node.left.value);
      staticParts.push('');

      // Preserve the full expression as a parameter
      expressions.push({
        text: sourceCode.getText(node),
        node: node,
      });

      return { staticParts, expressions };
    }

    // For other concatenation patterns, treat the expression as a single param
    staticParts.push('');
    staticParts.push('');

    expressions.push({
      text: sourceCode.getText(node),
      node: node,
    });

    return { staticParts, expressions };
  }

  return { staticParts, expressions };
}

/**
 * Create a fix for converting Error with templates to MetaError.
 * @param {object} fixer - The ESLint fixer object
 * @param {object} node - The Error constructor call node
 * @param {object} sourceCode - The ESLint source code object
 * @returns {object|null} The fix or null if not safe to fix
 */
function createErrorToMetaErrorFix(fixer, node, sourceCode) {
  // Only handle simple cases with a single argument template literal
  if (node.arguments.length !== 1) {
    return null;
  }

  // Skip custom error classes.
  if (node.callee.name !== 'Error' && node.callee.name !== 'MetaError') {
    return null;
  }

  const arg = node.arguments[0];

  // Skip non-template/non-concatenation messages
  if (!isTemplateWithExpressions(arg) && !isStringConcatenation(arg)) {
    return null;
  }

  const { staticParts, expressions } = extractTemplatePartsAndExpressions(
    arg,
    sourceCode
  );

  // Skip if extraction failed
  if (staticParts.length === 0) {
    return null;
  }

  let staticMessage;

  // For string concatenation, never trim; preserve spacing
  if (isStringConcatenation(arg)) {
    staticMessage = staticParts.join('');
  } else {
    // For template literals, apply the "simple template" trimming logic
    const joinedMessage = staticParts.join('');
    const isSimpleTemplate = staticParts.length === 2;
    const endsWithSingleSpace =
      joinedMessage.endsWith(' ') && !joinedMessage.endsWith('  ');

    staticMessage =
      isSimpleTemplate && endsWithSingleSpace
        ? joinedMessage.trim()
        : joinedMessage;
  }

  // Build metadata object from expressions
  const metadataProps = expressions.map((expr, i) => {
    // Try to derive a readable property name from the expression
    let propName = `param${i + 1}`;

    // If the expression is an identifier, use shorthand
    if (expr.node.type === 'Identifier') {
      propName = expr.node.name;
      return propName; // Use shorthand syntax for identifiers
    }

    return `${propName}: ${expr.text}`;
  });

  // Build the MetaError constructor call
  const metaErrorText = `new MetaError('${staticMessage.replace(/'/g, "\\'")}', { ${metadataProps.join(', ')} })`;

  return fixer.replaceText(node, metaErrorText);
}

/**
 * Create a fix for converting logging templates to structured format.
 * @param {object} fixer - The ESLint fixer object
 * @param {object} node - The logging function call node
 * @param {object} sourceCode - The ESLint source code object
 * @returns {object|null} The fix or null if not safe to fix
 */
function createLoggingFunctionFix(fixer, node, sourceCode) {
  // Only handle cases with a single argument template literal
  if (node.arguments.length !== 1) {
    return null;
  }

  const arg = node.arguments[0];

  // Skip non-template/non-concatenation messages
  if (!isTemplateWithExpressions(arg) && !isStringConcatenation(arg)) {
    return null;
  }

  const { staticParts, expressions } = extractTemplatePartsAndExpressions(
    arg,
    sourceCode
  );

  // Skip if extraction failed
  if (staticParts.length === 0) {
    return null;
  }

  let staticMessage;

  // For string concatenation, never trim; preserve spacing
  if (isStringConcatenation(arg)) {
    staticMessage = staticParts.join('');
  } else {
    // For template literals, apply the "simple template" trimming logic
    const joinedMessage = staticParts.join('');
    const isSimpleTemplate = staticParts.length === 2;
    const endsWithSingleSpace =
      joinedMessage.endsWith(' ') && !joinedMessage.endsWith('  ');

    staticMessage =
      isSimpleTemplate && endsWithSingleSpace
        ? joinedMessage.trim()
        : joinedMessage;
  }

  // Build metadata object from expressions
  const metadataProps = expressions.map((expr, i) => {
    // Try to derive a readable property name from the expression
    let propName = `param${i + 1}`;

    // If the expression is an identifier, use shorthand
    if (expr.node.type === 'Identifier') {
      propName = expr.node.name;
      return propName; // Use shorthand syntax for identifiers
    }

    return `${propName}: ${expr.text}`;
  });

  // Build the structured logging call
  const functionName = sourceCode.getText(node.callee);
  const structuredLogText = `${functionName}('${staticMessage.replace(/'/g, "\\'")}', { ${metadataProps.join(', ')} })`;

  return fixer.replaceText(node, structuredLogText);
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce structured logging patterns',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [], // no options supported
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      // Detect Error constructor calls with templates
      NewExpression(node) {
        // Match Error classes or classes ending with "Error"
        const isErrorClass =
          node.callee.type === 'Identifier' &&
          (node.callee.name === 'Error' || node.callee.name.endsWith('Error'));

        if (
          isErrorClass &&
          node.arguments.length === 1 &&
          (isTemplateWithExpressions(node.arguments[0]) ||
            isStringConcatenation(node.arguments[0]))
        ) {
          context.report({
            node,
            message: `Use MetaError with structured metadata instead of ${node.callee.name} with template literals`,
            fix(fixer) {
              // Try to create a fix, return null if not reliable
              return createErrorToMetaErrorFix(fixer, node, sourceCode);
            },
          });
        }
      },

      // Detect logging calls with templates
      CallExpression(node) {
        // Check if this is a call to one of our logging functions
        if (
          node.callee.type === 'Identifier' &&
          LOGGING_FUNCTIONS.includes(node.callee.name)
        ) {
          // Check all arguments for templates or concatenation
          for (let i = 0; i < node.arguments.length; i++) {
            const arg = node.arguments[i];
            if (isTemplateWithExpressions(arg) || isStringConcatenation(arg)) {
              context.report({
                node,
                message: `Use structured logging format for ${node.callee.name} instead of template literals`,
                fix(fixer) {
                  // Only fix simple single-argument cases
                  if (node.arguments.length === 1) {
                    return createLoggingFunctionFix(fixer, node, sourceCode);
                  }
                  // For multi-argument cases, skip auto-fix
                  return null;
                },
              });
              // Report only once per call
              break;
            }
          }
        }
      },
    };
  },
};
