# @factory/require-tsx-test-stories-files

Enforce that TSX files have corresponding test and Storybook stories files.

## Rationale

React components benefit from both unit tests and visual documentation:

- Test files ensure component logic works correctly
- Stories files provide visual documentation and enable UI testing
- Makes component behavior and appearance reviewable
- Enables Storybook-driven development workflow

## Rule Details

This rule requires that `.tsx` files have:
1. A corresponding `.test.tsx` file in the same directory
2. A corresponding `.stories.tsx` file in the same directory

**Exempt files** (no test/stories required):
- `index.tsx` - barrel exports
- Next.js App Router files: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`, `default.tsx`
- `types.tsx`, `constants.tsx`, `enums.tsx` - definition files
- `style-props.tsx`, `config.tsx`, `schema.tsx` - configuration files

## Examples

### Incorrect

```
src/
  components/
    Button.tsx           # Missing Button.test.tsx and Button.stories.tsx
    Card.tsx             # Missing Card.test.tsx and Card.stories.tsx
```

### Correct

```
src/
  components/
    Button.tsx
    Button.test.tsx
    Button.stories.tsx
    Card.tsx
    Card.test.tsx
    Card.stories.tsx
    index.tsx            # Exempt - barrel file
  app/
    page.tsx             # Exempt - Next.js page
    layout.tsx           # Exempt - Next.js layout
```

## Related Rules

- [@factory/require-test-files](../require-test-files/README.md)
- [@factory/test-file-location](../test-file-location/README.md)
