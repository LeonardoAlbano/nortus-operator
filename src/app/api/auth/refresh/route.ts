import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NORTUS_API_URL, NORTUS_COOKIE, sessionCookieOptions } from '@/lib/env';

type RefreshResponse = { access_token: string };

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(NORTUS_COOKIE)?.value;

  if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

  const upstream = await fetch(`${NORTUS_API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ access_token: token }),
    cache: 'no-store',
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '');
    return NextResponse.json({ message: text || 'Request failed' }, { status: upstream.status });
  }

  const data = (await upstream.json()) as RefreshResponse;

  const res = NextResponse.json({ ok: true });
  res.cookies.set(NORTUS_COOKIE, data.access_token, {
    ...sessionCookieOptions(),
    maxAge: 60 * 60 * 24,
  });
  return res;
}
