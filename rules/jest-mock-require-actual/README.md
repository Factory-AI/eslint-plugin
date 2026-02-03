# @factory/jest-mock-require-actual

Enforce that `jest.mock()` calls include `jest.requireActual()` to preserve unmocked exports.

## Rationale

When using `jest.mock()`, Jest auto-mocks all exports by default. This often leads to unexpected behavior when you only want to mock specific functions. Including `jest.requireActual()` ensures:

- Only explicitly mocked functions are replaced
- Other exports retain their real implementation
- Tests are more predictable and less brittle
- Accidental over-mocking is prevented

## Rule Details

This rule requires that `jest.mock()` calls have a second argument containing `jest.requireActual()`. It also warns against pointless mocks that only spread `requireActual` without overriding anything.

## Examples

### Incorrect

```ts
// Missing second argument - all exports will be auto-mocked
jest.mock('@/utils/api');

// Missing jest.requireActual() - manual mock without preserving exports
jest.mock('@/utils/api', () => ({
  fetchData: jest.fn(),
}));

// Pointless mock - just spreading requireActual does nothing
jest.mock('@/utils/api', () => ({
  ...jest.requireActual('@/utils/api'),
}));
```

### Correct

```ts
// Preserve real exports, only mock specific functions
jest.mock('@/utils/api', () => ({
  ...jest.requireActual('@/utils/api'),
  fetchData: jest.fn(),
}));

// Mock with explicit overrides
jest.mock('@/services/auth', () => ({
  ...jest.requireActual('@/services/auth'),
  login: jest.fn().mockResolvedValue({ token: 'test' }),
  logout: jest.fn(),
}));
```

## Related Rules

- [@factory/jest-mock-absolute-paths](../jest-mock-absolute-paths/README.md)
- [@factory/no-unstable-mock-module](../no-unstable-mock-module/README.md)
