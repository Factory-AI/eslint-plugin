# @factory/test-utils-organization

Enforce that test utilities (mocks, fixtures) are organized in `test-utils` directories.

## Rationale

Centralizing test utilities improves test maintainability:

- Shared mocks and fixtures are easy to find and reuse
- Prevents duplicate mock implementations across test files
- Makes test setup consistent across the codebase
- Separates test infrastructure from test cases

## Rule Details

This rule enforces that test utility code (mocks, fixtures, test factories) is placed in `test-utils` directories rather than scattered across test files or source directories.

**What belongs in `test-utils`:**
- Mock implementations (`mocks.ts`, `mocks/`)
- Test fixtures (`fixtures.ts`, `fixtures/`)
- Test helper functions (`helpers.ts`, `helpers/`)
- Test factories (`createMock*`, `testFactory*`)

**Detected patterns:**
- Functions named `mock*`, `createMock*`, `fake*`, `stub*`
- Files with `mock`, `fixture`, or `testData` in the name
- Test factory patterns

## Examples

### Incorrect

```ts
// src/utils/api.ts - mock functions don't belong in source files
export function mockFetchData() {
  return { data: 'test' };
}

export const createMockUser = () => ({ id: '1', name: 'Test' });
```

### Correct

```
src/
  utils/
    api.ts
    api.test.ts
  test-utils/
    mocks.ts           # Shared mock implementations
    fixtures.ts        # Test data fixtures
    helpers.ts         # Test helper functions
    mocks/
      api.ts           # API-specific mocks
    fixtures/
      users.ts         # User fixtures
```

```ts
// src/test-utils/mocks.ts
export function mockFetchData() {
  return { data: 'test' };
}

export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  ...overrides,
});
```

## Related Rules

- [@factory/test-file-location](../test-file-location/README.md)
- [@factory/jest-mock-require-actual](../jest-mock-require-actual/README.md)
