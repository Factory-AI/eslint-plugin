# @factory/require-v0-route-handle-middleware

Enforce that v0 API route handlers use `handleV0RouteMiddleware`.

## Rationale

v0 API routes use a specific middleware pattern for:

- API versioning compatibility
- Consistent authentication handling
- Request/response transformation
- API-specific logging and monitoring

All v0 routes must use this middleware to ensure consistent API behavior.

## Rule Details

This rule requires that route handlers in `/api/v0/` directories call `handleV0RouteMiddleware` inside their `.handler()` callback.

## Examples

### Incorrect

```ts
// api/v0/users/route.ts - missing handleV0RouteMiddleware
export const { GET } = route({
  listUsers: routeOperation({ method: 'GET' })
    .outputs([])
    .handler(async (req) => {
      const users = await getUsers();
      return NextResponse.json(users);
    }),
});
```

### Correct

```ts
// api/v0/users/route.ts
export const { GET } = route({
  listUsers: routeOperation({ method: 'GET' })
    .outputs([])
    .handler(async (req) =>
      handleV0RouteMiddleware(req, async (user) => {
        const users = await getUsers();
        return NextResponse.json(users);
      })
    ),
});
```

## Related Rules

- [@factory/require-route-middleware](../require-route-middleware/README.md)
- [@factory/require-v0-strict-schemas](../require-v0-strict-schemas/README.md)
