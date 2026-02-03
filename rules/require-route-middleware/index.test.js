'use strict';

const { RuleTester } = require('eslint');
const rule = require('./index');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('require-route-middleware', rule, {
  valid: [
    // Non-route.ts files should not be checked
    {
      filename: 'src/app/api/sessions/utils.ts',
      code: `
        export async function GET(request) {
          return NextResponse.json({ message: 'hello' });
        }
      `,
    },
    // v0 API routes should not be checked (covered by require-v0-route-*-middleware)
    {
      filename: 'src/app/api/v0/workspaces/route.ts',
      code: `
        import { route, routeOperation } from 'next-rest-framework';
        
        export const { GET } = route({
          listWorkspaces: routeOperation({ method: 'GET' })
            .outputs([])
            .middleware(verifyApiAuth)
            .handler(async (req) => {
              return { status: 200 };
            }),
        });
      `,
    },
    // Route files with first statement being middleware (function block)
    {
      filename: 'src/app/api/health/route.ts',
      code: `
        import { NextResponse } from 'next/server';
        import { handlePublicMiddleware } from '@/app/api/_utils/middleware';
        
        export async function GET(request) {
          return handlePublicMiddleware(request, async () => {
            return NextResponse.json({ status: 'ok' });
          });
        }
      `,
    },
    // Route files with directive followed by first-statement middleware
    {
      filename: 'src/app/api/health/route.ts',
      code: `
        import { NextResponse } from 'next/server';
        import { handlePublicMiddleware } from '@/app/api/_utils/middleware';
        
        export async function GET(request) {
          'use server';
          return handlePublicMiddleware(request, async () => {
            return NextResponse.json({ status: 'ok' });
          });
        }
      `,
    },
    // Arrow function concise body
    {
      filename: 'src/app/api/health/route.ts',
      code: `
        import { NextResponse } from 'next/server';
        import { handlePublicMiddleware } from '@/app/api/_utils/middleware';
        
        export const GET = async (request) => handlePublicMiddleware(request, async () => {
          return NextResponse.json({ status: 'ok' });
        });
      `,
    },
    // Route files with handleRouteMiddleware
    {
      filename: 'src/app/api/sessions/route.ts',
      code: `
        import { NextRequest, NextResponse } from 'next/server';
        import { handleRouteMiddleware } from '@/app/api/_utils/middleware';
        
        export async function GET(request) {
          return handleRouteMiddleware(request, async ({ user }) => {
            return NextResponse.json({ message: 'hello' });
          });
        }
      `,
    },
    // Route files with handleAdminRouteMiddleware
    {
      filename: 'src/app/api/admin/test/route.ts',
      code: `
        import { NextRequest, NextResponse } from 'next/server';
        import { handleAdminRouteMiddleware } from '@/app/api/_utils/middleware';
        import { AdminApiKeyNames } from '@factory/services/aws/enums';
        
        export async function POST(request) {
          return handleAdminRouteMiddleware(
            request,
            AdminApiKeyNames.TEST_API_KEY,
            async () => {
              return NextResponse.json({ message: 'admin' });
            }
          );
        }
      `,
    },
    // Route files with handleCronMiddleware
    {
      filename: 'src/app/api/cron/test/route.ts',
      code: `
        import { NextRequest, NextResponse } from 'next/server';
        import { handleCronMiddleware } from '@/app/api/_utils/middleware';
        
        export async function GET(request) {
          return handleCronMiddleware(request, async () => {
            return NextResponse.json({ message: 'cron' });
          });
        }
      `,
    },
    // Route files with handlePublicMiddleware
    {
      filename: 'src/app/api/health/route.ts',
      code: `
        import { NextRequest, NextResponse } from 'next/server';
        import { handlePublicMiddleware } from '@/app/api/_utils/middleware';
        
        export async function GET(request) {
          return handlePublicMiddleware(request, async () => {
            return NextResponse.json({ status: 'ok' });
          });
        }
      `,
    },
    // Route files with custom handle*Middleware function
    {
      filename: 'src/app/api/custom/route.ts',
      code: `
        import { NextRequest, NextResponse } from 'next/server';
        import { handleCustomMiddleware } from '@/app/api/_utils/middleware';
        
        export async function GET(request) {
          return handleCustomMiddleware(request, async () => {
            return NextResponse.json({ status: 'custom' });
          });
        }
      `,
    },
    // Route files with handler functions
    {
      filename: 'src/app/api/admin/test/route.ts',
      code: `
        import { createIndexStateHandler } from '@/utils/middleware';

        export const POST = createIndexStateHandler(async (body) => {
          return { status: 'updated' };
        });
      `,
    },
  ],

  invalid: [
    // Route files without any middleware calls
    {
      filename: 'src/app/api/sessions/route.ts',
      code: `
        import { NextRequest, NextResponse } from 'next/server';
        
        export async function GET(request) {
          return NextResponse.json({ message: 'hello' });
        }
      `,
      errors: [
        {
          messageId: 'missingMiddleware',
        },
      ],
    },
    // Route files with imports but no calls
    {
      filename: 'src/app/api/admin/test/route.ts',
      code: `
        import { NextRequest, NextResponse } from 'next/server';
        import { handleAdminRouteMiddleware } from '@/app/api/_utils/middleware';
        
        export async function POST(request) {
          // Middleware imported but not called
          return NextResponse.json({ message: 'admin' });
        }
      `,
      errors: [
        {
          messageId: 'missingMiddleware',
        },
      ],
    },
    // Route files with function calls that don't match the pattern
    {
      filename: 'src/app/api/test/route.ts',
      code: `
        import { NextRequest, NextResponse } from 'next/server';
        import { someOtherFunction } from '@/app/api/_utils/middleware';
        
        export async function GET(request) {
          return someOtherFunction(request, async () => {
            return NextResponse.json({ message: 'test' });
          });
        }
      `,
      errors: [
        {
          messageId: 'missingMiddleware',
        },
      ],
    },
    // Middleware call not first statement in function body
    {
      filename: 'src/app/api/health/route.ts',
      code: `
        import { NextResponse } from 'next/server';
        import { handlePublicMiddleware } from '@/app/api/_utils/middleware';
        
        export async function GET(request) {
          const x = 1;
          return handlePublicMiddleware(request, async () => {
            return NextResponse.json({ status: 'ok' });
          });
        }
      `,
      errors: [{ messageId: 'missingMiddleware' }],
    },
    // Await before middleware call
    {
      filename: 'src/app/api/health/route.ts',
      code: `
        import { NextResponse } from 'next/server';
        import { handlePublicMiddleware } from '@/app/api/_utils/middleware';
        
        async function log() {}
        export async function GET(request) {
          await log();
          return handlePublicMiddleware(request, async () => {
            return NextResponse.json({ status: 'ok' });
          });
        }
      `,
      errors: [{ messageId: 'missingMiddleware' }],
    },
  ],
});

console.log('All tests passed!');
