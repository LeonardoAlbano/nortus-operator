import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NORTUS_API_URL, NORTUS_COOKIE } from '@/lib/env';

type RouteCtx = { params: Promise<{ id: string }> };

async function proxy(upstream: Response) {
  const body = await upstream.text().catch(() => '');
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
    },
  });
}

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(NORTUS_COOKIE)?.value ?? null;
}

export async function GET(_: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;

  const token = await getToken();
  if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

  const res = await fetch(`${NORTUS_API_URL}/tickets/${encodeURIComponent(id)}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    cache: 'no-store',
  });

  return proxy(res);
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;

  const token = await getToken();
  if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

  const body = await req.text();
  const url = `${NORTUS_API_URL}/tickets/${encodeURIComponent(id)}`;

  const resPatch = await fetch(url, {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body,
    cache: 'no-store',
  });

  if (resPatch.status !== 405) return proxy(resPatch);

  const resPut = await fetch(url, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body,
    cache: 'no-store',
  });

  return proxy(resPut);
}

export async function DELETE(_: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;

  const token = await getToken();
  if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

  const res = await fetch(`${NORTUS_API_URL}/tickets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    cache: 'no-store',
  });

  return proxy(res);
}
