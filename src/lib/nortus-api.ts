import 'server-only';
import { cookies } from 'next/headers';
import { NORTUS_API_URL, NORTUS_COOKIE } from '@/lib/env';

type NortusApiInit = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export async function nortusApi<T>(path: string, init: NortusApiInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(NORTUS_COOKIE)?.value;

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(init.headers ?? {}),
  };

  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(`${NORTUS_API_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}
