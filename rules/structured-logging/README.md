# @factory/structured-logging

Enforce structured logging patterns for better log aggregation and analysis.

## Rationale

Structured logging improves observability and debugging:

- Log aggregation systems can parse and index structured data
- Dynamic values in separate fields enable filtering and querying
- Static message templates improve log grouping
- Prevents sensitive data from being interpolated into messages

## Rule Details

This rule enforces that logging functions (`logError`, `logException`, `logInfo`, `logWarn`) and error constructors use static message strings with dynamic values passed as structured metadata.

**Disallowed patterns:**
- Template literals with expressions: `` `Failed for user ${userId}` ``
- String concatenation: `'Failed for user ' + userId`

## Examples

### Incorrect

```ts
// Template literals with dynamic values
logError(`Failed to fetch data for user ${userId}`);

throw new Error(`Processing failed: ${error.message}`);

logException(error, `Request ${requestId} timed out`);

// String concatenation
logError('User ' + userId + ' not found');
```

### Correct

```ts
// Static messages with structured metadata
logError('Failed to fetch data', { userId });

throw new Error('Processing failed');

logException(error, 'Request timed out', { requestId });

// Static template literals (no expressions) are fine
logError(`Failed to fetch data`, { userId });

// Non-logging functions can use dynamic strings
console.log(`Debug: ${value}`);
const message = `Hello ${name}`;
```

## Related Rules

- [@factory/no-log-exception-with-throw](../no-log-exception-with-throw/README.md)
