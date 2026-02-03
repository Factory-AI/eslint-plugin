# @factory/errors-file-organization

Enforce that custom Error classes are defined in `errors.ts` files.

## Rationale

Centralizing error definitions improves error handling consistency:

- Developers know exactly where to find custom error types
- Enables consistent error handling patterns across the codebase
- Makes it easier to document and maintain error hierarchies
- Improves error tracking and monitoring setup

## Rule Details

This rule enforces three constraints:

1. Exported classes extending `Error` must be in files named `errors.ts`
2. Files named `errors.ts` can only contain Error class declarations
3. Imports in `errors.ts` are limited to external modules or internal `enums.ts`, `types.ts`, `constants.ts`, and `errors.ts` files

## Examples

### Incorrect

```ts
// src/utils.ts - error classes should not be in utility files
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

```ts
// src/errors.ts - cannot contain non-error code
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// Not allowed - helper functions don't belong here
export function formatError(error: Error): string {
  return error.message;
}
```

### Correct

```ts
// src/errors.ts
import { ErrorCode } from './enums';
import type { ErrorDetails } from './types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ApiError extends Error {
  code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}
```

## Related Rules

- [@factory/enum-file-organization](../enum-file-organization/README.md)
- [@factory/types-file-organization](../types-file-organization/README.md)
- [@factory/constants-file-organization](../constants-file-organization/README.md)
