import { NextResponse } from 'next/server';
import {
  fetchNortus,
  getSessionToken,
  refreshToken,
  sessionCookieName,
  sessionCookieOptions,
} from '@/lib/nortus-session';

async function proxyWithRefresh(upstreamPath: string, init: RequestInit) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

  const first = await fetchNortus(upstreamPath, init, token);

  if (first.status !== 401) {
    const text = await first.text().catch(() => '');
    return new NextResponse(text, {
      status: first.status,
      headers: { 'content-type': first.headers.get('content-type') ?? 'application/json' },
    });
  }

  const newToken = await refreshToken(token);
  if (!newToken) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

  const second = await fetchNortus(upstreamPath, init, newToken);
  const text = await second.text().catch(() => '');

  const res = new NextResponse(text, {
    status: second.status,
    headers: { 'content-type': second.headers.get('content-type') ?? 'application/json' },
  });

  if (second.ok) res.cookies.set(sessionCookieName(), newToken, sessionCookieOptions());
  return res;
}

export async function GET() {
  return proxyWithRefresh('/nortus-v1/simulador-planos', { method: 'GET' });
}
