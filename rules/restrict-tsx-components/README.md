# @factory/restrict-tsx-components

Enforce that React components are declared in files with specific naming conventions.

## Rationale

Consistent file naming for components improves project organization:

- Easy to identify component type from filename
- Clear separation between pages, modules, layouts, etc.
- Enables file-based routing conventions
- Makes the codebase more navigable

## Rule Details

This rule requires that React component declarations be in files ending with:
- `.page.tsx` - Page components
- `.module.tsx` - Feature modules
- `.layout.tsx` - Layout components
- `.view.tsx` - View components
- `.provider.tsx` - Context providers

Components in other files must be in an allowlist.

## Examples

### Incorrect

```tsx
// components/Dashboard.tsx - should be Dashboard.page.tsx or Dashboard.module.tsx
export const Dashboard = () => {
  return <div>Dashboard</div>;
};

// components/Sidebar.tsx - should be Sidebar.module.tsx or Sidebar.layout.tsx
export function Sidebar() {
  return <nav>Sidebar</nav>;
}
```

### Correct

```tsx
// pages/Dashboard.page.tsx
export const DashboardPage = () => {
  return <div>Dashboard</div>;
};

// components/Sidebar.module.tsx
export function SidebarModule() {
  return <nav>Sidebar</nav>;
}

// layouts/App.layout.tsx
export const AppLayout = ({ children }) => {
  return <main>{children}</main>;
};

// providers/Theme.provider.tsx
export const ThemeProvider = ({ children }) => {
  return <ThemeContext.Provider>{children}</ThemeContext.Provider>;
};
```

## Options

This rule accepts an options object:

```js
{
  "rules": {
    "@factory/restrict-tsx-components": ["error", {
      "allowlist": ["Button", "Icon", "Avatar"]
    }]
  }
}
```

- `allowlist`: Array of component names allowed in any file
