/**
 * @fileoverview Tests for filename-match-export rule
 * @author Factory Infrastructure Team
 */
'use strict';

const { RuleTester } = require('eslint');
const rule = require('./index');

// Configure RuleTester for TypeScript
const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

// Run the tests
ruleTester.run('filename-match-export', rule, {
  // Valid code examples - these should NOT trigger the rule
  valid: [
    // React component with matching filename
    {
      code: 'export function DropdownSelector() { return <div>test</div>; }',
      filename: 'DropdownSelector.tsx',
      name: 'allows React component with matching filename',
    },

    // Single exported function with matching filename
    {
      code: 'export function useApi() { return {}; }',
      filename: 'useApi.ts',
      name: 'allows single exported function with matching filename',
    },

    // Single exported arrow function with matching filename
    {
      code: 'export const useApi = () => { return {}; };',
      filename: 'useApi.ts',
      name: 'allows single exported arrow function with matching filename',
    },

    // Default export with matching filename
    {
      code: 'export default function DropdownSelector() { return <div>test</div>; }',
      filename: 'DropdownSelector.tsx',
      name: 'allows default export with matching filename',
    },

    // Multiple exports (rule doesn't apply)
    {
      code: 'export function foo() {} export function bar() {}',
      filename: 'utils.ts',
      name: 'allows multiple exports with any filename',
    },

    // index.ts files are ignored
    {
      code: 'export function Something() {}',
      filename: 'index.ts',
      name: 'allows index.ts files',
    },

    // index.tsx files are ignored
    {
      code: 'export function Something() {}',
      filename: 'index.tsx',
      name: 'allows index.tsx files',
    },

    // Test files are ignored
    {
      code: 'export function Something() {}',
      filename: 'Something.test.ts',
      name: 'allows test files',
    },

    // Spec files are ignored
    {
      code: 'export function Something() {}',
      filename: 'Something.spec.ts',
      name: 'allows spec files',
    },

    // Story files are ignored
    {
      code: 'export function Something() {}',
      filename: 'Something.stories.tsx',
      name: 'allows story files',
    },

    // File with no exports
    {
      code: 'function helper() {}',
      filename: 'utils.ts',
      name: 'allows files with no exports',
    },

    // React component exported as const with matching filename
    {
      code: 'export const Button = () => { return <button>test</button>; };',
      filename: 'Button.tsx',
      name: 'allows React component const with matching filename',
    },

    // .page.tsx files - SessionsPage component in Sessions.page.tsx
    {
      code: 'export function SessionsPage() { return <div>Sessions</div>; }',
      filename: 'Sessions.page.tsx',
      name: 'allows SessionsPage component in Sessions.page.tsx',
    },

    // .page.tsx files - UserProfilePage component in UserProfile.page.tsx
    {
      code: 'export const UserProfilePage = () => { return <div>Profile</div>; };',
      filename: 'UserProfile.page.tsx',
      name: 'allows UserProfilePage component in UserProfile.page.tsx',
    },

    // .page.tsx files - default export
    {
      code: 'export default function DashboardPage() { return <div>Dashboard</div>; }',
      filename: 'Dashboard.page.tsx',
      name: 'allows DashboardPage default export in Dashboard.page.tsx',
    },

    // .page.ts files (non-JSX)
    {
      code: 'export function SettingsPage() { return {}; }',
      filename: 'Settings.page.ts',
      name: 'allows SettingsPage component in Settings.page.ts',
    },

    // .page.jsx files
    {
      code: 'export function HomePage() { return <div>Home</div>; }',
      filename: 'Home.page.jsx',
      name: 'allows HomePage component in Home.page.jsx',
    },

    // .page.js files
    {
      code: 'export function AboutPage() { return {}; }',
      filename: 'About.page.js',
      name: 'allows AboutPage component in About.page.js',
    },

    // .module.tsx files
    {
      code: 'export const TerminalPaneModule = () => { return <div>Terminal</div>; };',
      filename: 'TerminalPane.module.tsx',
      name: 'allows TerminalPaneModule component in TerminalPane.module.tsx',
    },
    {
      code: 'export default function ButtonModule() { return <button>Click</button>; }',
      filename: 'Button.module.tsx',
      name: 'allows ButtonModule default export in Button.module.tsx',
    },

    // .layout.tsx files
    {
      code: 'export const AppLayoutLayout = () => { return <div>Layout</div>; };',
      filename: 'AppLayout.layout.tsx',
      name: 'allows AppLayoutLayout component in AppLayout.layout.tsx',
    },
    {
      code: 'export function AllotmentLayout() { return <div>Allotment</div>; }',
      filename: 'Allotment.layout.tsx',
      name: 'allows AllotmentLayout component in Allotment.layout.tsx',
    },

    // .view.tsx files
    {
      code: 'export const LoadingViewView = () => { return <div>Loading...</div>; };',
      filename: 'LoadingView.view.tsx',
      name: 'allows LoadingViewView component in LoadingView.view.tsx',
    },
    {
      code: 'export default function ErrorView() { return <div>Error</div>; }',
      filename: 'Error.view.tsx',
      name: 'allows ErrorView default export in Error.view.tsx',
    },

    // .provider.tsx files
    {
      code: 'export const AuthProviderProvider = ({ children }) => { return <div>{children}</div>; };',
      filename: 'AuthProvider.provider.tsx',
      name: 'allows AuthProviderProvider component in AuthProvider.provider.tsx',
    },
    {
      code: 'export function ThemeProvider() { return <div>Theme</div>; }',
      filename: 'Theme.provider.tsx',
      name: 'allows ThemeProvider component in Theme.provider.tsx',
    },
  ],

  // Invalid code examples - these should trigger the rule
  invalid: [
    // React component with mismatched filename
    {
      code: 'export function DropdownSelector() { return <div>test</div>; }',
      filename: 'Dropdown.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'Dropdown.tsx',
            exportType: 'React component',
            exportedName: 'DropdownSelector',
            expectedFilename: 'DropdownSelector.tsx',
          },
        },
      ],
      name: 'rejects React component with mismatched filename',
    },

    // Single exported function with mismatched filename
    {
      code: 'export function useApi() { return {}; }',
      filename: 'api.ts',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'api.ts',
            exportType: 'function',
            exportedName: 'useApi',
            expectedFilename: 'useApi.ts',
          },
        },
      ],
      name: 'rejects single exported function with mismatched filename',
    },

    // Single exported arrow function with mismatched filename
    {
      code: 'export const fetchData = () => { return {}; };',
      filename: 'api.ts',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'api.ts',
            exportType: 'function',
            exportedName: 'fetchData',
            expectedFilename: 'fetchData.ts',
          },
        },
      ],
      name: 'rejects single exported arrow function with mismatched filename',
    },

    // Default export with mismatched filename
    {
      code: 'export default function MyComponent() { return <div>test</div>; }',
      filename: 'Component.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'Component.tsx',
            exportType: 'React component',
            exportedName: 'MyComponent',
            expectedFilename: 'MyComponent.tsx',
          },
        },
      ],
      name: 'rejects default export with mismatched filename',
    },

    // React component const with mismatched filename
    {
      code: 'export const UserProfile = () => { return <div>test</div>; };',
      filename: 'Profile.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'Profile.tsx',
            exportType: 'React component',
            exportedName: 'UserProfile',
            expectedFilename: 'UserProfile.tsx',
          },
        },
      ],
      name: 'rejects React component const with mismatched filename',
    },

    // .page.tsx file with wrong component name (should be SessionsPage)
    {
      code: 'export function Sessions() { return <div>Sessions</div>; }',
      filename: 'Sessions.page.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'Sessions.page.tsx',
            exportType: 'React component',
            exportedName: 'Sessions',
            expectedFilename: 'Sessions.tsx',
          },
        },
      ],
      name: 'rejects Sessions component in Sessions.page.tsx (should be SessionsPage)',
    },

    // .page.tsx file with completely wrong component name
    {
      code: 'export function UserDashboard() { return <div>Dashboard</div>; }',
      filename: 'Dashboard.page.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'Dashboard.page.tsx',
            exportType: 'React component',
            exportedName: 'UserDashboard',
            expectedFilename: 'UserDashboard.tsx',
          },
        },
      ],
      name: 'rejects UserDashboard component in Dashboard.page.tsx',
    },

    // Page component in non-.page.tsx file (should suggest .page.tsx)
    {
      code: 'export function SessionsPage() { return <div>Sessions</div>; }',
      filename: 'SessionsPage.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'SessionsPage.tsx',
            exportType: 'React component',
            exportedName: 'SessionsPage',
            expectedFilename: 'Sessions.page.tsx',
          },
        },
      ],
      name: 'rejects SessionsPage component in SessionsPage.tsx (should be Sessions.page.tsx)',
    },

    // Page component in wrong .page.tsx file
    {
      code: 'export const UserProfilePage = () => { return <div>Profile</div>; };',
      filename: 'Profile.page.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'Profile.page.tsx',
            exportType: 'React component',
            exportedName: 'UserProfilePage',
            expectedFilename: 'UserProfile.page.tsx',
          },
        },
      ],
      name: 'rejects UserProfilePage component in Profile.page.tsx (should be UserProfile.page.tsx)',
    },

    // Page component default export with wrong filename
    {
      code: 'export default function SettingsPage() { return <div>Settings</div>; }',
      filename: 'SettingsPage.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'SettingsPage.tsx',
            exportType: 'React component',
            exportedName: 'SettingsPage',
            expectedFilename: 'Settings.page.tsx',
          },
        },
      ],
      name: 'rejects SettingsPage default export in SettingsPage.tsx (should be Settings.page.tsx)',
    },

    // .module.tsx file with wrong component name
    {
      code: 'export function TerminalPane() { return <div>Terminal</div>; }',
      filename: 'TerminalPane.module.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'TerminalPane.module.tsx',
            exportType: 'React component',
            exportedName: 'TerminalPane',
            expectedFilename: 'TerminalPane.tsx',
          },
        },
      ],
      name: 'rejects TerminalPane component in TerminalPane.module.tsx (should be TerminalPaneModule)',
    },

    // Module component in non-.module.tsx file (should suggest .module.tsx)
    {
      code: 'export function ButtonModule() { return <button>Click</button>; }',
      filename: 'ButtonModule.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'ButtonModule.tsx',
            exportType: 'React component',
            exportedName: 'ButtonModule',
            expectedFilename: 'Button.module.tsx',
          },
        },
      ],
      name: 'rejects ButtonModule component in ButtonModule.tsx (should be Button.module.tsx)',
    },

    // .layout.tsx file with wrong component name
    {
      code: 'export function AppLayout() { return <div>Layout</div>; }',
      filename: 'AppLayout.layout.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'AppLayout.layout.tsx',
            exportType: 'React component',
            exportedName: 'AppLayout',
            expectedFilename: 'App.layout.tsx',
          },
        },
      ],
      name: 'rejects AppLayout component in AppLayout.layout.tsx (should be in App.layout.tsx)',
    },

    // Layout component in non-.layout.tsx file (should suggest .layout.tsx)
    {
      code: 'export function RootLayoutLayout() { return <div>Root</div>; }',
      filename: 'RootLayoutLayout.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'RootLayoutLayout.tsx',
            exportType: 'React component',
            exportedName: 'RootLayoutLayout',
            expectedFilename: 'RootLayout.layout.tsx',
          },
        },
      ],
      name: 'rejects RootLayoutLayout component in RootLayoutLayout.tsx (should be RootLayout.layout.tsx)',
    },

    // .view.tsx file with wrong component name
    {
      code: 'export function LoadingView() { return <div>Loading...</div>; }',
      filename: 'LoadingView.view.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'LoadingView.view.tsx',
            exportType: 'React component',
            exportedName: 'LoadingView',
            expectedFilename: 'Loading.view.tsx',
          },
        },
      ],
      name: 'rejects LoadingView component in LoadingView.view.tsx (should be in Loading.view.tsx)',
    },

    // View component in non-.view.tsx file (should suggest .view.tsx)
    {
      code: 'export function ErrorViewView() { return <div>Error</div>; }',
      filename: 'ErrorViewView.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'ErrorViewView.tsx',
            exportType: 'React component',
            exportedName: 'ErrorViewView',
            expectedFilename: 'ErrorView.view.tsx',
          },
        },
      ],
      name: 'rejects ErrorViewView component in ErrorViewView.tsx (should be ErrorView.view.tsx)',
    },

    // .provider.tsx file with wrong component name
    {
      code: 'export function AuthProvider() { return <div>Auth</div>; }',
      filename: 'AuthProvider.provider.tsx',
      errors: [
        {
          messageId: 'filenameMismatch',
          data: {
            filename: 'AuthProvider.provider.tsx',
            exportType: 'React component',
            exportedName: 'AuthProvider',
            expectedFilename: 'Auth.provider.tsx',
          },
        },
      ],
      name: 'rejects AuthProvider component in AuthProvider.provider.tsx (should be in Auth.provider.tsx)',
    },
  ],
});
