# @factory/no-exported-string-union-types

Enforce using enums instead of exported string union types.

## Rationale

Enums provide advantages over string union types:

- Runtime values that can be iterated and logged
- Better refactoring support - renaming an enum value updates all usages
- Clearer intent and documentation
- Consistent with file organization rules (`enums.ts`)

## Rule Details

This rule disallows exporting type aliases that are unions of string literals. Use TypeScript enums instead.

**Note:** Non-exported string unions and unions with non-string types are allowed.

## Examples

### Incorrect

```ts
// Exported string union types are not allowed
export type Status = 'active' | 'inactive' | 'pending';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type Theme = 'light' | 'dark';
```

### Correct

```ts
// Use enums instead (in enums.ts)
export enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

export enum Direction {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

// Non-exported unions are allowed
type InternalStatus = 'loading' | 'ready';

// Mixed unions are allowed (not all strings)
export type Result = 'success' | 'error' | number;

// Unions with other types are allowed
export type Nullable<T> = T | null;
```

## Related Rules

- [@factory/enum-file-organization](../enum-file-organization/README.md)
