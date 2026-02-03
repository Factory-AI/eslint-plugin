# Example TypeScript Project

This is an example project demonstrating how to use `@factory/linters`.

## Setup

```bash
npm install
npx factory-linters-setup
```

## Running ESLint

```bash
npm run lint
```

## Project Structure

This example follows Factory's file organization conventions:

- `enums.ts` - All enum definitions
- `types.ts` - All type/interface definitions
- `constants.ts` - All constant values
- `errors.ts` - All custom error classes
- `user-service.ts` - Business logic (filename matches exported functions)
- `index.ts` - Public API exports
