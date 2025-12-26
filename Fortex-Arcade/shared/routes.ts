import { z } from 'zod';
import { insertUserSchema, users, mineSchema, verifySchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    verify: {
      method: 'POST' as const,
      path: '/api/auth/verify',
      input: verifySchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(), // Returns the user
        400: errorSchemas.validation,
      },
    },
  },
  user: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:worldId',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  mining: {
    claim: {
      method: 'POST' as const,
      path: '/api/mining/claim',
      input: mineSchema,
      responses: {
        200: z.object({ success: z.boolean(), newBalance: z.number() }),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
