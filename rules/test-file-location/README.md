# @factory/test-file-location

Enforce that test files are colocated with the source files they test.

## Rationale

Colocating test files with source files improves developer experience:

- Easy to find tests for any given file
- Moving a file automatically moves its tests
- No need to maintain parallel directory structures
- Reduces cognitive overhead when navigating the codebase

## Rule Details

This rule enforces three requirements for test files:

1. **Naming convention**: Test files must be named `*.test.ts` or `*.test.tsx`
2. **Colocation**: Test files must be in the same directory as the file they test, not in separate `test/` or `__tests__/` directories
3. **Content**: Test files must contain at least one test block (`describe`, `it`, `test`, etc.)

## Examples

### Incorrect

```
src/
  utils/
    format.ts
  __tests__/           # Tests should not be in __tests__
    format.test.ts
  test/                # Tests should not be in test/
    utils/
      format.test.ts
```

```ts
// format.test.ts - empty test file
// No describe/it/test blocks
export {};
```

### Correct

```
src/
  utils/
    format.ts
    format.test.ts     # Colocated with source file
  components/
    Button.tsx
    Button.test.tsx    # Colocated with source file
```

```ts
// format.test.ts
describe('format', () => {
  it('should format dates correctly', () => {
    expect(formatDate(new Date())).toBe('2024-01-01');
  });
});
```

## Related Rules

- [@factory/require-test-files](../require-test-files/README.md)
- [@factory/test-utils-organization](../test-utils-organization/README.md)
