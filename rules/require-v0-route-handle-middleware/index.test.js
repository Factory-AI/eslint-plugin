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

ruleTester.run('require-v0-route-handle-middleware', rule, {
  valid: [
    // v0 route with handleV0RouteMiddleware (expression body)
    {
      filename: 'src/app/api/v0/workspaces/route.ts',
      code: `
        import { route, routeOperation } from 'next-rest-framework';
        import { handleV0RouteMiddleware } from '@/api/v0/middleware/middleware';
        
        export const { GET } = route({
          listWorkspaces: routeOperation({ method: 'GET' })
            .outputs([])
            .handler(async (req) =>
              handleV0RouteMiddleware(req, async (user) => {
                return { status: 200 };
              })
            ),
        });
      `,
    },
    // v0 route with handleV0RouteMiddleware (block body with return)
    {
      filename: 'src/app/api/v0/workspaces/route.ts',
      code: `
        import { route, routeOperation } from 'next-rest-framework';
        import { handleV0RouteMiddleware } from '@/api/v0/middleware/middleware';
        
        export const { GET } = route({
          listWorkspaces: routeOperation({ method: 'GET' })
            .outputs([])
            .handler(async (req) => {
              return handleV0RouteMiddleware(req, async (user) => {
                return { status: 200 };
              });
            }),
        });
      `,
    },
    // v0 route with context parameter
    {
      filename: 'src/app/api/v0/workspaces/[workspaceId]/route.ts',
      code: `
        import { route, routeOperation } from 'next-rest-framework';
        import { handleV0RouteMiddleware } from '@/api/v0/middleware/middleware';
        
        export const { GET } = route({
          getWorkspace: routeOperation({ method: 'GET' })
            .outputs([])
            .handler(async (req, context) =>
              handleV0RouteMiddleware(req, async (user) => {
                const { workspaceId } = context.params;
                return { status: 200 };
              })
            ),
        });
      `,
    },
    // Multiple route operations, all with middleware
    {
      filename: 'src/app/api/v0/workspaces/route.ts',
      code: `
        import { route, routeOperation } from 'next-rest-framework';
        import { handleV0RouteMiddleware } from '@/api/v0/middleware/middleware';
        
        export const { GET, POST } = route({
          listWorkspaces: routeOperation({ method: 'GET' })
            .outputs([])
            .handler(async (req) =>
              handleV0RouteMiddleware(req, async (user) => {
                return { status: 200 };
              })
            ),
          createWorkspace: routeOperation({ method: 'POST' })
            .outputs([])
            .handler(async (req) =>
              handleV0RouteMiddleware(req, async (user) => {
                return { status: 201 };
              })
            ),
        });
      `,
    },
    // Non-v0 route (should be skipped)
    {
      filename: 'src/app/api/workspaces/route.ts',
      code: `
        import { NextResponse } from 'next/server';
        
        export async function GET(req) {
          return NextResponse.json({ data: [] });
        }
      `,
    },
    // Non-route file in v0 (should be skipped)
    {
      filename: 'src/app/api/v0/middleware/middleware.ts',
      code: `
        export function handleV0RouteMiddleware() {}
      `,
    },
  ],

  invalid: [
    // v0 route without handleV0RouteMiddleware
    {
      filename: 'src/app/api/v0/workspaces/route.ts',
      code: `
        import { route, routeOperation } from 'next-rest-framework';
        
        export const { GET } = route({
          listWorkspaces: routeOperation({ method: 'GET' })
            .outputs([])
            .handler(async (req) => {
              return { status: 200 };
            }),
        });
      `,
      errors: [{ messageId: 'missingMiddleware' }],
    },
    // v0 route with wrong middleware name
    {
      filename: 'src/app/api/v0/workspaces/route.ts',
      code: `
        import { route, routeOperation } from 'next-rest-framework';
        import { someOtherMiddleware } from '@/middleware';
        
        export const { GET } = route({
          listWorkspaces: routeOperation({ method: 'GET' })
            .outputs([])
            .handler(async (req) =>
              someOtherMiddleware(req, async (user) => {
                return { status: 200 };
              })
            ),
        });
      `,
      errors: [{ messageId: 'missingMiddleware' }],
    },
    // Multiple route operations, one missing middleware
    {
      filename: 'src/app/api/v0/workspaces/[id]/route.ts',
      code: `
        import { route, routeOperation } from 'next-rest-framework';
        import { handleV0RouteMiddleware } from '@/api/v0/middleware/middleware';
        
        export const { GET, DELETE } = route({
          getWorkspace: routeOperation({ method: 'GET' })
            .outputs([])
            .handler(async (req) =>
              handleV0RouteMiddleware(req, async (user) => {
                return { status: 200 };
              })
            ),
          deleteWorkspace: routeOperation({ method: 'DELETE' })
            .outputs([])
            .handler(async (req) => {
              return { status: 204 };
            }),
        });
      `,
      errors: [{ messageId: 'missingMiddleware' }],
    },
  ],
});

console.log('All require-v0-route-handle-middleware tests passed!');
