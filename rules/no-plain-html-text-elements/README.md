# @factory/no-plain-html-text-elements

Disallow wrapping text directly in plain HTML elements.

## Rationale

Using design system typography components instead of plain HTML elements ensures:

- Consistent typography across the application
- Proper accessibility attributes are applied
- Text styling follows design system guidelines
- Easier theming and style updates

## Rule Details

This rule disallows plain text content inside common HTML elements like `div`, `span`, `p`, `h1`-`h6`, etc. Use typography components from your design system instead.

**Restricted elements:** `div`, `span`, `p`, `h1`-`h6`, `section`, `article`, `strong`, `em`, `li`, `td`, `th`, and more.

## Examples

### Incorrect

```tsx
// Plain text in HTML elements
<div>Hello World</div>

<span>Click here</span>

<p>This is a paragraph</p>

<h1>Page Title</h1>

// Text mixed with components
<div>
  Welcome back, <UserName />
</div>
```

### Correct

```tsx
// Use typography components
<Text>Hello World</Text>

<Label>Click here</Label>

<Paragraph>This is a paragraph</Paragraph>

<Heading level={1}>Page Title</Heading>

// Non-text content is fine
<div>
  <Icon name="check" />
  <Button>Submit</Button>
</div>

// Empty or whitespace-only is fine
<div>
  <ChildComponent />
</div>
```
