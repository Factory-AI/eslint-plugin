# @factory/require-test-files

Enforce that TypeScript files have corresponding test files.

## Rationale

Requiring test files ensures comprehensive test coverage across the codebase:

- Every module has at least a test file scaffold
- Prevents untested code from being forgotten
- Makes test coverage gaps visible during code review
- Encourages test-driven development practices

## Rule Details

This rule requires that `.ts` files (not `.tsx`) have a corresponding `.test.ts` file in the same directory.

**Exempt files** (no test required):
- `enums.ts`, `types.ts`, `constants.ts`, `errors.ts` - pure definitions
- `schema.ts`, `config.ts`, `env.ts` - configuration files
- `index.ts`, `route.ts` - entry points and route handlers
- Files starting with `use` - React hooks (covered by integration tests)
- `.d.ts` files - type declarations

## Examples

### Incorrect

```
src/
  utils/
    format.ts      # Missing format.test.ts
    validate.ts    # Missing validate.test.ts
```

### Correct

```
src/
  utils/
    format.ts
    format.test.ts
    validate.ts
    validate.test.ts
    types.ts       # Exempt - type definitions
    constants.ts   # Exempt - constants
```

## Related Rules

- [@factory/require-tsx-test-stories-files](../require-tsx-test-stories-files/README.md)
- [@factory/test-file-location](../test-file-location/README.md)
