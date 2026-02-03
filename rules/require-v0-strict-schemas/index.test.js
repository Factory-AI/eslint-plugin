'use strict';

const { RuleTester } = require('eslint');
const rule = require('./index');

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

ruleTester.run('require-v0-strict-schemas', rule, {
  valid: [
    // Schema with .strict()
    {
      filename: 'src/api/v0/schemas/machine-template.ts',
      code: `
        import { z } from 'zod';
        
        export const MachineTemplateSchema = z.object({
          id: z.string(),
          name: z.string(),
        }).strict();
      `,
    },
    // Schema with .strict() in chain with z. prefix
    {
      filename: 'src/api/v0/schemas/pagination.ts',
      code: `
        import { z } from 'zod';
        
        export const PaginationSchema = z
          .object({
            limit: z.number(),
            cursor: z.string().optional(),
          })
          .strict();
      `,
    },
    // Schema with .extend() and .strict()
    {
      filename: 'src/api/v0/schemas/machine-template.ts',
      code: `
        import { z } from 'zod';
        
        const BaseSchema = z.object({
          id: z.string(),
        }).strict();
        
        export const ExtendedSchema = BaseSchema.extend({
          name: z.string(),
        }).strict();
      `,
    },
    // Route file with strict inline schema
    {
      filename: 'src/app/api/v0/machines/templates/[templateId]/route.ts',
      code: `
        import { z } from 'zod';
        
        const output = {
          body: z.object({}).strict(),
        };
      `,
    },
    // Non-v0 file (should be skipped)
    {
      filename: 'src/api/workspaces/schemas.ts',
      code: `
        import { z } from 'zod';
        
        export const WorkspaceSchema = z.object({
          id: z.string(),
        });
      `,
    },
    // Non-schema, non-route file in v0 (should be skipped)
    {
      filename: 'src/api/v0/middleware/middleware.ts',
      code: `
        import { z } from 'zod';
        
        const internalSchema = z.object({
          data: z.string(),
        });
      `,
    },
    // Schema with describe and strict
    {
      filename: 'src/api/v0/schemas/errors.ts',
      code: `
        import { z } from 'zod';
        
        export const ErrorSchema = z.object({
          message: z.string().describe('Error message'),
        }).strict();
      `,
    },
  ],

  invalid: [
    // Schema without .strict()
    {
      filename: 'src/api/v0/schemas/machine-template.ts',
      code: `
        import { z } from 'zod';
        
        export const MachineTemplateSchema = z.object({
          id: z.string(),
          name: z.string(),
        });
      `,
      output: `
        import { z } from 'zod';
        
        export const MachineTemplateSchema = z.object({
          id: z.string(),
          name: z.string(),
        }).strict();
      `,
      errors: [{ messageId: 'missingStrict' }],
    },
    // Schema with z. prefix but no .strict()
    {
      filename: 'src/api/v0/schemas/pagination.ts',
      code: `
        import { z } from 'zod';
        
        export const PaginationSchema = z
          .object({
            limit: z.number(),
          });
      `,
      output: `
        import { z } from 'zod';
        
        export const PaginationSchema = z
          .object({
            limit: z.number(),
          }).strict();
      `,
      errors: [{ messageId: 'missingStrict' }],
    },
    // Route file with inline schema without .strict()
    {
      filename: 'src/app/api/v0/machines/templates/[templateId]/route.ts',
      code: `
        import { z } from 'zod';
        
        const output = {
          body: z.object({}),
        };
      `,
      output: `
        import { z } from 'zod';
        
        const output = {
          body: z.object({}).strict(),
        };
      `,
      errors: [{ messageId: 'missingStrict' }],
    },
    // Extended schema without .strict()
    {
      filename: 'src/api/v0/schemas/machine-template.ts',
      code: `
        import { z } from 'zod';
        
        const BaseSchema = z.object({
          id: z.string(),
        }).strict();
        
        export const ExtendedSchema = BaseSchema.extend({
          name: z.string(),
        });
      `,
      output: `
        import { z } from 'zod';
        
        const BaseSchema = z.object({
          id: z.string(),
        }).strict();
        
        export const ExtendedSchema = BaseSchema.extend({
          name: z.string(),
        }).strict();
      `,
      errors: [{ messageId: 'missingStrict' }],
    },
  ],
});

console.log('All require-v0-strict-schemas tests passed!');
