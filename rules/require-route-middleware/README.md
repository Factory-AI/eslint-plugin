# @factory/require-route-middleware

Enforce that Next.js route handlers call middleware as their first statement.

## Rationale

Route middleware provides essential functionality that must run before route logic:

- Authentication and authorization checks
- Request logging and tracing
- Rate limiting and security headers
- Error boundary and monitoring setup

Forgetting middleware leaves routes unprotected and unmonitored.

## Rule Details

This rule requires that exported HTTP method handlers (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, etc.) in `route.ts` files call a `handle*Middleware` function as their very first statement.

**Recognized middleware patterns:**
- `handleRouteMiddleware`
- `handleAdminRouteMiddleware`
- `handleCronMiddleware`
- `handlePublicMiddleware`

**Note:** v0 API routes (`/api/v0/`) are excluded - use `@factory/require-v0-route-handle-middleware` instead.

## Examples

### Incorrect

```ts
// route.ts - missing middleware call
export async function GET(request: Request) {
  const data = await fetchData();
  return NextResponse.json(data);
}

// route.ts - middleware not first statement
export async function POST(request: Request) {
  const body = await request.json();
  return handleRouteMiddleware(request, async () => {
    // ...
  });
}
```

### Correct

```ts
// route.ts
export async function GET(request: Request) {
  return handleRouteMiddleware(request, async () => {
    const data = await fetchData();
    return NextResponse.json(data);
  });
}

export async function POST(request: Request) {
  return handleAdminRouteMiddleware(request, async (user) => {
    const body = await request.json();
    return NextResponse.json({ success: true });
  });
}
```

## Related Rules

- [@factory/require-v0-route-handle-middleware](../require-v0-route-handle-middleware/README.md)
