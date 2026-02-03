/**
 * @fileoverview Tests for no-plain-html-text-elements rule
 * @author Factory Infrastructure Team
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('./index');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('no-plain-html-text-elements', rule, {
  valid: [
    // Empty elements are allowed
    {
      code: '<div />',
    },
    {
      code: '<span></span>',
    },
    // Elements with only whitespace are allowed
    {
      code: '<div>  \n  </div>',
    },
    // Elements with JSX children are allowed
    {
      code: '<div><Button>Click me</Button></div>',
    },
    {
      code: '<span><Icon /></span>',
    },
    // React components are allowed
    {
      code: '<StyledDiv>Some text here</StyledDiv>',
    },
    {
      code: '<Text>This is allowed</Text>',
    },
    {
      code: '<Typography>Header text</Typography>',
    },
    // Allowed elements with text when configured
    {
      code: '<button>Click me</button>',
      options: [{ allowedElements: ['button'] }],
    },
    {
      code: '<a href="/link">Link text</a>',
      options: [{ allowedElements: ['a'] }],
    },
    // Non-restricted HTML elements
    {
      code: '<button>Submit</button>',
    },
    {
      code: '<input value="text" />',
    },
    {
      code: '<img alt="description" />',
    },
    // Empty JSX expression
    {
      code: '<div>{null}</div>',
    },
    {
      code: '<div>{undefined}</div>',
    },
    {
      code: '<div>{false}</div>',
    },
  ],

  invalid: [
    // Plain text in div
    {
      code: '<div>This is plain text</div>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'div' },
        },
      ],
    },
    // Plain text in span
    {
      code: '<span>Some text</span>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'span' },
        },
      ],
    },
    // Plain text in p
    {
      code: '<p>Paragraph text</p>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'p' },
        },
      ],
    },
    // Headers with text
    {
      code: '<h1>Header</h1>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'h1' },
        },
      ],
    },
    {
      code: '<h2>Subheader</h2>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'h2' },
        },
      ],
    },
    // Text with JSX expression
    {
      code: '<div>{text}</div>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'div' },
        },
      ],
    },
    {
      code: '<span>{"string literal"}</span>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'span' },
        },
      ],
    },
    // Template literals
    {
      code: '<div>{`Template ${variable}`}</div>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'div' },
        },
      ],
    },
    // Conditional expressions
    {
      code: '<p>{condition ? "Yes" : "No"}</p>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'p' },
        },
      ],
    },
    // Member expressions
    {
      code: '<div>{props.text}</div>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'div' },
        },
      ],
    },
    // String concatenation
    {
      code: '<span>{"Hello " + name}</span>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'span' },
        },
      ],
    },
    // Semantic HTML elements
    {
      code: '<section>Content section</section>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'section' },
        },
      ],
    },
    {
      code: '<article>Article content</article>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'article' },
        },
      ],
    },
    // Text formatting elements
    {
      code: '<strong>Bold text</strong>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'strong' },
        },
      ],
    },
    {
      code: '<em>Italic text</em>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'em' },
        },
      ],
    },
    // List items
    {
      code: '<li>List item</li>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'li' },
        },
      ],
    },
    // Table cells
    {
      code: '<td>Cell content</td>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'td' },
        },
      ],
    },
    {
      code: '<th>Header cell</th>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'th' },
        },
      ],
    },
    // Custom message
    {
      code: '<div>Text</div>',
      options: [
        { customMessage: 'Use styled components instead of HTML elements' },
      ],
      errors: [
        {
          message: 'Use styled components instead of HTML elements',
        },
      ],
    },
    // Mixed content with text
    {
      code: '<div>Text before <Button /> text after</div>',
      errors: [
        {
          messageId: 'noPlainHtml',
          data: { element: 'div' },
        },
      ],
    },
  ],
});

console.log('All tests passed for no-plain-html-text-elements rule!');
