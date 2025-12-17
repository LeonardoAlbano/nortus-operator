import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  fetchNortus,
  getSessionToken,
  refreshToken,
  sessionCookieName,
  sessionCookieOptions,
} from '@/lib/nortus-session';

export async function GET() {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetchNortus('/nortus-v1/chat', { method: 'GET' }, token);

  if (res.status === 401) {
    const next = await refreshToken(token);

    if (!next) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const store = await cookies();
    store.set(sessionCookieName(), next, sessionCookieOptions());

    const retry = await fetchNortus('/nortus-v1/chat', { method: 'GET' }, next);
    const data = await retry.json().catch(() => null);

    return NextResponse.json(data ?? {}, { status: retry.status });
  }

  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: res.status });
}
