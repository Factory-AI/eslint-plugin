# @factory/types-file-organization

Enforce that TypeScript types and interfaces are defined in `types.ts` files.

## Rationale

Centralizing type definitions improves code organization and maintainability:

- Developers know exactly where to find type definitions
- Prevents type sprawl across the codebase
- Makes it easier to share types between modules
- Enables better code review for API contracts

## Rule Details

This rule enforces three constraints:

1. Exported TypeScript types and interfaces must be in files named `types.ts`
2. Files named `types.ts` can only contain type aliases and interface declarations
3. Imports in `types.ts` are limited to external modules or internal `enums.ts`, `types.ts`, and `schema.ts` files

## Examples

### Incorrect

```ts
// src/utils.ts - types should not be in utility files
export interface User {
  id: string;
  name: string;
}

export type UserId = string;
```

```ts
// src/types.ts - cannot import from arbitrary files
import { helper } from './utils';

export interface Config {
  value: ReturnType<typeof helper>;
}
```

### Correct

```ts
// src/types.ts
import { Status } from './enums';
import type { BaseSchema } from './schema';

export interface User {
  id: string;
  name: string;
  status: Status;
}

export type UserId = string;

export type Config = {
  schema: BaseSchema;
  enabled: boolean;
};
```

## Related Rules

- [@factory/enum-file-organization](../enum-file-organization/README.md)
- [@factory/constants-file-organization](../constants-file-organization/README.md)
- [@factory/errors-file-organization](../errors-file-organization/README.md)
