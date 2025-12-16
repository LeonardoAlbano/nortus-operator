import 'server-only';
import { cookies } from 'next/headers';
import { NORTUS_API_URL, NORTUS_COOKIE } from '@/lib/env';

export function sessionCookieName() {
  return NORTUS_COOKIE;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  };
}

export async function getSessionToken() {
  const store = await cookies();
  return store.get(sessionCookieName())?.value ?? null;
}

export async function fetchNortus(path: string, init: RequestInit, token?: string) {
  const headers = new Headers(init.headers);

  if (!headers.has('accept')) headers.set('accept', 'application/json');
  if (token) headers.set('authorization', `Bearer ${token}`);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');

  return fetch(`${NORTUS_API_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
}

export async function refreshToken(accessToken: string) {
  const res = await fetch(`${NORTUS_API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ access_token: accessToken }),
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const data = (await res.json().catch(() => null)) as { access_token?: string } | null;
  const next = data?.access_token;
  return typeof next === 'string' && next.length ? next : null;
}

function base64UrlToString(input: string) {
  const base64 = input
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(input.length / 4) * 4, '=');
  return Buffer.from(base64, 'base64').toString('utf8');
}

export async function getSessionUser() {
  const token = await getSessionToken();
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(base64UrlToString(parts[1])) as Record<string, unknown>;
    const email = typeof payload.email === 'string' ? payload.email : undefined;
    const name =
      typeof payload.name === 'string'
        ? payload.name
        : typeof payload.username === 'string'
          ? payload.username
          : undefined;

    return { email, name };
  } catch {
    return null;
  }
}
