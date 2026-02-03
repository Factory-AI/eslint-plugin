# @factory/no-log-exception-with-throw

Disallow `logException()` or `logError()` in the same block as a throw statement.

## Rationale

Logging an error and then throwing it causes duplicate error reporting:

- The error gets logged at the throw site
- The error gets logged again when caught upstream
- Log aggregation shows the same error multiple times
- Makes it harder to determine actual error frequency

Choose one: either log the error and handle it, or throw it for upstream handling.

## Rule Details

This rule disallows calling `logException()` or `logError()` in the same code block as a `throw` statement.

## Examples

### Incorrect

```ts
// Logging then throwing - duplicate error reporting
function processData(data) {
  try {
    validate(data);
  } catch (error) {
    logException(error, 'Validation failed');
    throw new Error('Invalid data');
  }
}

// Same block violation
if (condition) {
  logError('Something went wrong');
  throw new Error('Failed');
}
```

### Correct

```ts
// Option 1: Log and handle locally
function processData(data) {
  try {
    validate(data);
  } catch (error) {
    logException(error, 'Validation failed');
    return { success: false, error: 'Invalid data' };
  }
}

// Option 2: Throw and let upstream handle logging
function processData(data) {
  try {
    validate(data);
  } catch (error) {
    throw new Error('Invalid data');
  }
}

// Different blocks are fine
function handleRequest() {
  if (isRecoverable) {
    logError('Recoverable error occurred');
    return fallback();
  }

  if (isFatal) {
    throw new Error('Fatal error');
  }
}
```

## Related Rules

- [@factory/structured-logging](../structured-logging/README.md)
