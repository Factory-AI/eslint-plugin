# @factory/filename-match-export

Enforce that filenames match their exported React components or functions.

## Rationale

Consistent naming between files and their exports improves code navigation:

- Easy to find components by searching for filenames
- Clear relationship between file and its primary export
- Reduces confusion when importing modules
- Enables better IDE features like "Go to Definition"

## Rule Details

This rule requires that:

1. Files with a single exported React component or function must have the filename match the export name
2. Special suffixes are supported: `.page.tsx`, `.module.tsx`, `.layout.tsx`, `.view.tsx`, `.provider.tsx`
3. Files with special suffixes must have exports with corresponding suffixes (e.g., `Sessions.page.tsx` exports `SessionsPage`)

**Ignored files:**
- `utils.ts`, `constants.ts`, `types.ts` - utility files with multiple exports
- `index.ts` - barrel files
- Test and story files

## Examples

### Incorrect

```ts
// Button.tsx - component name doesn't match filename
export const PrimaryButton = () => <button>Click</button>;

// Sessions.page.tsx - should export SessionsPage, not Sessions
export const Sessions = () => <div>Sessions</div>;

// UserProfile.tsx - should be in UserProfile.page.tsx if it's a page
export const UserProfilePage = () => <div>Profile</div>;
```

### Correct

```ts
// Button.tsx
export const Button = () => <button>Click</button>;

// Sessions.page.tsx
export const SessionsPage = () => <div>Sessions</div>;

// UserProfile.page.tsx
export const UserProfilePage = () => <div>Profile</div>;

// Theme.provider.tsx
export const ThemeProvider = ({ children }) => (
  <Context.Provider>{children}</Context.Provider>
);
```

## Options

This rule accepts an options object:

```js
{
  "rules": {
    "@factory/filename-match-export": ["error", {
      "ignoredFiles": ["utils.ts", "constants.ts", "types.ts"]
    }]
  }
}
```

- `ignoredFiles`: Array of filenames to ignore (default: `["utils.ts", "constants.ts", "types.ts"]`)
