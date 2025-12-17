import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NORTUS_API_URL, NORTUS_COOKIE } from '@/lib/env';

function safeJson(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function readTotalItems(payload: unknown) {
  if (!payload || typeof payload !== 'object') return 0;
  const anyPayload = payload as Record<string, unknown>;
  const v =
    anyPayload.total_items ?? anyPayload.totalItems ?? anyPayload.total ?? anyPayload.count ?? 0;

  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

async function fetchCount(token: string, url: URL, status: 'open' | 'in_progress' | 'done') {
  const params = new URLSearchParams(url.searchParams);
  params.set('page', '1');
  params.set('pageSize', '1');
  params.set('status', status);

  const upstreamUrl = `${NORTUS_API_URL}/tickets?${params.toString()}`;

  const upstream = await fetch(upstreamUrl, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const text = await upstream.text().catch(() => '');
  const payload = safeJson(text);

  if (!upstream.ok) {
    throw new Error(text || 'Upstream stats failed');
  }

  return readTotalItems(payload);
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(NORTUS_COOKIE)?.value;

  if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

  try {
    const url = new URL(req.url);

    const [open, inProgress, done] = await Promise.all([
      fetchCount(token, url, 'open'),
      fetchCount(token, url, 'in_progress'),
      fetchCount(token, url, 'done'),
    ]);

    return NextResponse.json({ open, inProgress, done }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to load stats';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
