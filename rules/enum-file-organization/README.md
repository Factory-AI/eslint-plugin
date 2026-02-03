# @factory/enum-file-organization

Enforce that TypeScript enums are defined in `enums.ts` files.

## Rationale

Consistent file organization improves codebase navigability. When all enums live in dedicated `enums.ts` files:

- Developers know exactly where to find enum definitions
- Prevents enum sprawl across the codebase
- Makes refactoring and code review easier
- Ensures enums remain pure value definitions without side effects

## Rule Details

This rule enforces two constraints:

1. Exported TypeScript enums must be in files named `enums.ts`
2. Files named `enums.ts` can only contain enum declarations and type exports (no imports allowed)

## Examples

### Incorrect

```ts
// src/utils.ts - enums should not be in utility files
export enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}
```

```ts
// src/enums.ts - enums.ts files cannot have imports
import { something } from './other';

export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
}
```

### Correct

```ts
// src/enums.ts
export enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
}

// Type exports are allowed
export type StatusType = keyof typeof Status;
```

## Related Rules

- [@factory/types-file-organization](../types-file-organization/README.md)
- [@factory/constants-file-organization](../constants-file-organization/README.md)
- [@factory/errors-file-organization](../errors-file-organization/README.md)
