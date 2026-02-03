# @factory/require-v0-strict-schemas

Enforce that v0 API Zod schemas use `.strict()` on `z.object()`.

## Rationale

Strict schemas reject unknown properties, which is essential for API safety:

- Prevents typos in request payloads from being silently ignored
- Makes API contracts explicit and well-defined
- Catches client-side bugs early
- Improves API documentation accuracy

## Rule Details

This rule requires that `z.object()` calls in v0 API files include `.strict()` in the method chain. It also checks `.extend()` calls on schemas.

**Applies to:** Files in `/api/v0/` that are either schema files (`/schemas/`) or route files (`route.ts`).

## Examples

### Incorrect

```ts
// api/v0/users/schemas/create-user.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

// Unknown properties like { name: "John", emial: "typo@test.com" }
// would be silently accepted
```

### Correct

```ts
// api/v0/users/schemas/create-user.ts
import { z } from 'zod';

export const CreateUserSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
  })
  .strict();

// Extended schemas also need .strict()
export const UpdateUserSchema = CreateUserSchema.extend({
  id: z.string(),
}).strict();
```

## Related Rules

- [@factory/require-v0-route-handle-middleware](../require-v0-route-handle-middleware/README.md)
