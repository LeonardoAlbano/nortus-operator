import { z } from 'zod';

const EnvSchema = z.object({
  NORTUS_API_BASE_URL: z.string().url(),
  NORTUS_COOKIE: z.string().min(1).default('nortus_token'),
});

const parsed = EnvSchema.parse({
  NORTUS_API_BASE_URL: process.env.NORTUS_API_BASE_URL,
  NORTUS_COOKIE: process.env.NORTUS_COOKIE,
});

export const env = parsed;

export const NORTUS_API_URL = parsed.NORTUS_API_BASE_URL;
export const NORTUS_COOKIE = parsed.NORTUS_COOKIE;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
}
