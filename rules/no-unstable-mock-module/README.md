# @factory/no-unstable-mock-module

Disallow `jest.unstable_mockModule()` in favor of `jest.mock()`.

## Rationale

`jest.unstable_mockModule()` is an experimental API that may change or be removed:

- The "unstable" prefix indicates it's not ready for production use
- Behavior may change between Jest versions
- `jest.mock()` is the stable, well-documented alternative
- Using stable APIs ensures long-term test reliability

## Rule Details

This rule disallows any use of `jest.unstable_mockModule()` and suggests using `jest.mock()` instead.

## Examples

### Incorrect

```ts
jest.unstable_mockModule('fs', () => ({
  default: {},
}));

jest.unstable_mockModule('@/utils/api', () => ({
  fetchData: jest.fn(),
}));
```

### Correct

```ts
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(),
}));

jest.mock('@/utils/api', () => ({
  ...jest.requireActual('@/utils/api'),
  fetchData: jest.fn(),
}));
```

## Related Rules

- [@factory/jest-mock-absolute-paths](../jest-mock-absolute-paths/README.md)
- [@factory/jest-mock-require-actual](../jest-mock-require-actual/README.md)
