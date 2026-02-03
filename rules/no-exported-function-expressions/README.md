# @factory/no-exported-function-expressions

Enforce that exported functions use function declarations instead of function expressions.

## Rationale

Function declarations provide better developer experience than function expressions:

- Function declarations are hoisted, making code order more flexible
- Better stack traces with named functions
- Clearer intent - declarations signal "this is a named function"
- Consistent style across the codebase

## Rule Details

This rule disallows exporting arrow functions or function expressions. Instead, use function declarations with the `function` keyword.

## Examples

### Incorrect

```ts
// Arrow function exports are not allowed
export const fetchData = async () => {
  return await api.get('/data');
};

// Function expressions are not allowed
export const processItem = function (item) {
  return item.value * 2;
};

// Default export arrow functions are not allowed
export default () => <div>Hello</div>;
```

### Correct

```ts
// Use function declarations
export async function fetchData() {
  return await api.get('/data');
}

export function processItem(item) {
  return item.value * 2;
}

// Named default export
export default function HelloComponent() {
  return <div>Hello</div>;
}
```

## Related Rules

- [@factory/filename-match-export](../filename-match-export/README.md)
