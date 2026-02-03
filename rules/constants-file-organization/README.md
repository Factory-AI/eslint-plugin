# @factory/constants-file-organization

Enforce that exported constants are defined in `constants.ts` files.

## Rationale

Centralizing constants improves code organization and maintainability:

- Developers know exactly where to find configuration values
- Prevents magic values scattered across the codebase
- Makes it easier to update values in one place
- Enables better visibility into application configuration

## Rule Details

This rule enforces three constraints:

1. Exported constants must be in files named `constants.ts`
2. Files named `constants.ts` can only contain `const` declarations
3. Imports in `constants.ts` are limited to external modules, media files, or internal `enums.ts`, `types.ts`, `constants.ts`, and `schema.ts` files

**Note:** Constants initialized by function calls, `new` expressions, or tagged templates are exempt (e.g., `export const logger = createLogger()`).

## Examples

### Incorrect

```ts
// src/utils.ts - constants should not be in utility files
export const API_URL = 'https://api.example.com';
export const MAX_RETRIES = 3;
```

```ts
// src/constants.ts - cannot contain functions
export const API_URL = 'https://api.example.com';

export function getUrl() {
  return API_URL;
}
```

### Correct

```ts
// src/constants.ts
import { Environment } from './enums';

export const API_URL = 'https://api.example.com';
export const MAX_RETRIES = 3;
export const TIMEOUT_MS = 5000;

export const CONFIG = {
  environment: Environment.Production,
  debug: false,
};
```

```ts
// src/logger.ts - function calls are allowed elsewhere
export const logger = createLogger({ level: 'info' });
```

## Related Rules

- [@factory/enum-file-organization](../enum-file-organization/README.md)
- [@factory/types-file-organization](../types-file-organization/README.md)
- [@factory/errors-file-organization](../errors-file-organization/README.md)
