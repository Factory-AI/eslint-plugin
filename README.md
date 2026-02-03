# @factory/eslint-plugin

An open-source ESLint plugin showcasing how agent-native organizations use custom lint rules to drive AI coding agents toward better results.

## About This Project

This codebase is forked from what is used internally at [Factory](https://factory.ai) and has been altered to be more generic. We are sharing this as requested by the developer community and to showcase an example of what an agent-native organization does with custom lint rules to improve agent output quality.

**All code in this repository is fully AI-generated.**

To learn more about our approach:
- [Using Linters to Direct Agents](https://factory.ai/news/using-linters-to-direct-agents)
- [Agent Readiness](https://factory.ai/news/agent-readiness)

## How to Use This Repository

**Our recommendation is NOT to simply import this package.** Instead, take the ideas from these rules and build your own set of custom lint rules tailored to your codebase, tech stack, and conventions.

We have included comprehensive markdown documentation for each rule (in `rules/<rule-name>/README.md`) that makes it easy for any AI agent to parse and adapt to your custom tech stack or framework.

> **Note:** This repository is not planned to be actively maintained or updated. It is designed for sharing and inspiration only.

## Available Configurations

| Config | Use Case | Description |
|--------|----------|-------------|
| `plugin:@factory/base` | Base | Core TypeScript/JavaScript rules |
| `plugin:@factory/recommended` | Packages/Libraries | Base + Factory plugin rules |
| `plugin:@factory/frontend` | React/Vite apps | Recommended + React/JSX rules |
| `plugin:@factory/backend` | Backend apps | Recommended + backend constraints |

### Configuration Hierarchy

```mermaid
graph TD
    A[base] --> B[recommended]
    B --> C[frontend]
    B --> D[backend]
```

## Factory Plugin Rules

This plugin includes custom rules that enforce code organization and best practices:

### File Organization
- `@factory/enum-file-organization` - Enums must live in `enums.ts` files
- `@factory/types-file-organization` - Type definitions must live in `types.ts` files
- `@factory/constants-file-organization` - Constants must live in `constants.ts` files
- `@factory/errors-file-organization` - Error classes must live in `errors.ts` files
- `@factory/test-utils-organization` - Test utilities must live under `test-utils/`
- `@factory/test-file-location` - Test files must be colocated with source files

### Naming & Exports
- `@factory/filename-match-export` - Filenames must match exported components/functions
- `@factory/no-exported-function-expressions` - Prefer function declarations for exports
- `@factory/no-exported-string-union-types` - Prefer enums over string union types

### Testing
- `@factory/require-test-files` - TypeScript files must have corresponding test files
- `@factory/require-tsx-test-stories-files` - TSX files need test and story files
- `@factory/jest-mock-absolute-paths` - Jest mocks must use absolute paths
- `@factory/jest-mock-require-actual` - Jest mocks must include `jest.requireActual()`
- `@factory/no-unstable-mock-module` - Disallow `unstable_mockModule`

### Logging
- `@factory/structured-logging` - Enforce structured logging patterns
- `@factory/no-log-exception-with-throw` - No logging exceptions before throwing

### API Routes (Next.js/Express)
- `@factory/require-route-middleware` - Route files must use middleware
- `@factory/require-v0-route-handle-middleware` - v0 routes need specific middleware
- `@factory/require-v0-strict-schemas` - v0 routes need strict schema validation

### React
- `@factory/no-dynamic-styled-components` - No dynamic styled-components
- `@factory/no-plain-html-text-elements` - No plain text in HTML elements
- `@factory/no-use-effect-in-hooks` - Restrict useEffect in custom hooks
- `@factory/restrict-tsx-components` - Enforce component patterns

## Installation

```bash
npm install @factory/eslint-plugin eslint --save-dev
```

## Quick Start

Create an `.eslintrc.js` file in your project root:

### For TypeScript packages/libraries

```js
module.exports = {
  root: true,
  plugins: ['@factory'],
  extends: ['plugin:@factory/recommended'],
};
```

### For frontend applications (React/Vite)

```js
module.exports = {
  root: true,
  plugins: ['@factory'],
  extends: ['plugin:@factory/frontend'],
};
```

### For backend applications

```js
module.exports = {
  root: true,
  plugins: ['@factory'],
  extends: ['plugin:@factory/backend'],
};
```

## License

MIT
