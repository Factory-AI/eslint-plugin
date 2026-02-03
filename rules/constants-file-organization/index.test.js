/**
 * @fileoverview Tests for constants-file-organization rule
 * @author Factory Infrastructure Team
 */

'use strict';

const rule = require('./index');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('constants-file-organization', rule, {
  valid: [
    // Exported const in constants.ts file
    {
      code: 'export const API_URL = "https://api.example.com";',
      filename: 'constants.ts',
    },
    // Multiple exported consts in constants.ts file
    {
      code: `
        export const API_URL = "https://api.example.com";
        export const TIMEOUT = 5000;
        export const MAX_RETRIES = 3;
      `,
      filename: 'constants.ts',
    },
    // Non-exported const in non-constants file
    {
      code: 'const INTERNAL_CONST = 42;',
      filename: 'utils.ts',
    },
    // Import from external module in constants.ts
    {
      code: `
        import { z } from 'zod';
        export const SCHEMA = z.object({ id: z.string() });
      `,
      filename: 'constants.ts',
    },
    // Import from enums.ts in constants.ts
    {
      code: `
        import { UserRole } from './enums';
        export const DEFAULT_ROLE = UserRole.USER;
      `,
      filename: 'constants.ts',
    },
    // Import from types.ts in constants.ts
    {
      code: `
        import type { User } from './types';
        export const DEFAULT_USER: User = { id: '1', name: 'John' };
      `,
      filename: 'constants.ts',
    },
    // Import from schema.ts in constants.ts
    {
      code: `
        import { userSchema } from './schema';
        export const VALIDATION_SCHEMA = userSchema;
      `,
      filename: 'constants.ts',
    },
    // Re-export from constants.ts
    {
      code: `
        export { API_URL } from './config/constants';
      `,
      filename: 'constants.ts',
    },
    // Type imports in constants.ts
    {
      code: `
        import type { Config } from './types';
        export const DEFAULT_CONFIG: Config = { debug: false };
      `,
      filename: 'constants.ts',
    },
    // Nested path imports for allowed files
    {
      code: `
        import { UserRole } from '../shared/enums';
        import type { Config } from '../../types/types';
        import { baseSchema } from './nested/schema';
        export const DEFAULT_ROLE = UserRole.ADMIN;
      `,
      filename: 'constants.ts',
    },
    // Exported const with call expression in non-constants file (should be allowed)
    {
      code: 'export const logger = createLogger();',
      filename: 'utils.ts',
    },
    // Exported const with new expression in non-constants file (should be allowed)
    {
      code: 'export const url = new URL("https://example.com");',
      filename: 'config.ts',
    },
    // Multiple exported consts where one is a call expression in non-constants file
    {
      code: 'export const instance = getInstance(), config = getConfig();',
      filename: 'setup.ts',
    },
    // Exported const with tagged template expression (styled-components) in non-constants file (should be allowed)
    {
      code: 'export const StyledButton = styled.button`color: red;`;',
      filename: 'components/Button.tsx',
    },
    // Exported const with styled-components attrs method in non-constants file (should be allowed)
    {
      code: `export const StatusContainer = styled(Stack).attrs({ gap: 'md' })\`padding: var(--spacing-lg);\`;`,
      filename: 'components/CreationStatus.tsx',
    },
  ],

  invalid: [
    // Exported const in non-constants file
    {
      code: 'export const API_URL = "https://api.example.com";',
      filename: 'utils.ts',
      errors: [
        {
          messageId: 'constInWrongFile',
        },
      ],
    },
    // Function declaration in constants.ts
    {
      code: `
        export function helper() {
          return 42;
        }
      `,
      filename: 'constants.ts',
      errors: [
        {
          messageId: 'nonConstInConstantsFile',
        },
      ],
    },
    // Class declaration in constants.ts
    {
      code: `
        export class MyClass {
          value = 42;
        }
      `,
      filename: 'constants.ts',
      errors: [
        {
          messageId: 'nonConstInConstantsFile',
        },
      ],
    },
    // Enum declaration in constants.ts
    {
      code: `
        export enum Status {
          ACTIVE = 'active',
          INACTIVE = 'inactive',
        }
      `,
      filename: 'constants.ts',
      errors: [
        {
          messageId: 'nonConstInConstantsFile',
        },
      ],
    },
    // Type declaration in constants.ts
    {
      code: `
        export type User = {
          id: string;
          name: string;
        };
      `,
      filename: 'constants.ts',
      errors: [
        {
          messageId: 'nonConstInConstantsFile',
        },
      ],
    },
    // Interface declaration in constants.ts
    {
      code: `
        export interface User {
          id: string;
          name: string;
        }
      `,
      filename: 'constants.ts',
      errors: [
        {
          messageId: 'nonConstInConstantsFile',
        },
      ],
    },
    // Let declaration in constants.ts
    {
      code: `
        export let mutableValue = 42;
      `,
      filename: 'constants.ts',
      errors: [
        {
          messageId: 'nonConstInConstantsFile',
        },
      ],
    },
    // Var declaration in constants.ts
    {
      code: `
        export var oldStyleVar = 42;
      `,
      filename: 'constants.ts',
      errors: [
        {
          messageId: 'nonConstInConstantsFile',
        },
      ],
    },
    // Import from utils.ts in constants.ts (not allowed)
    {
      code: `
        import { helper } from './utils';
        export const VALUE = helper();
      `,
      filename: 'constants.ts',
      errors: [
        {
          messageId: 'invalidImportInConstantsFile',
        },
      ],
    },
    // Import from non-allowed internal file
    {
      code: `
        import { something } from './helpers';
        export const VALUE = something;
      `,
      filename: 'constants.ts',
      errors: [
        {
          messageId: 'invalidImportInConstantsFile',
        },
      ],
    },
    // Multiple violations
    {
      code: `
        import { helper } from './utils';
        export const VALUE = helper();
        export function myFunction() {
          return 42;
        }
      `,
      filename: 'constants.ts',
      errors: [
        {
          messageId: 'invalidImportInConstantsFile',
        },
        {
          messageId: 'nonConstInConstantsFile',
        },
      ],
    },
    // Exported const in a different directory's non-constants file
    {
      code: 'export const CONFIG = { api: "https://api.example.com" };',
      filename: 'src/config/index.ts',
      errors: [
        {
          messageId: 'constInWrongFile',
        },
      ],
    },
    // Exported const with non-call expression (literal) should still be reported
    {
      code: 'export const API_URL = "https://api.example.com";',
      filename: 'config.ts',
      errors: [
        {
          messageId: 'constInWrongFile',
        },
      ],
    },
    // Exported const with object literal should still be reported
    {
      code: 'export const CONFIG = { debug: true };',
      filename: 'settings.ts',
      errors: [
        {
          messageId: 'constInWrongFile',
        },
      ],
    },
  ],
});
