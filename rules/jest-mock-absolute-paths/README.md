# @factory/jest-mock-absolute-paths

Enforce that `jest.mock()` uses absolute paths instead of relative paths.

## Rationale

Using absolute paths in `jest.mock()` calls improves test reliability and maintainability:

- Absolute paths are unambiguous and don't break when files are moved
- Makes it clear which module is being mocked
- Prevents issues with Jest's module resolution
- Enables easier refactoring of test file locations

## Rule Details

This rule requires that all `jest.mock()`, `jest.doMock()`, and `jest.unmock()` calls use absolute paths (e.g., `@/utils/api`) rather than relative paths (e.g., `./utils` or `../api`).

## Examples

### Incorrect

```ts
// Relative paths are not allowed
jest.mock('./utils');
jest.mock('../services/api');
jest.mock('../../lib/helpers');

// require.resolve is also not allowed
jest.mock(require.resolve('some-module'));
```

### Correct

```ts
// Absolute paths with path aliases
jest.mock('@/utils/api');
jest.mock('@factory/common/logger');

// External modules (no path prefix)
jest.mock('axios');
jest.mock('lodash');

// Scoped packages
jest.mock('@testing-library/react');
```

## Related Rules

- [@factory/jest-mock-require-actual](../jest-mock-require-actual/README.md)
- [@factory/no-unstable-mock-module](../no-unstable-mock-module/README.md)
