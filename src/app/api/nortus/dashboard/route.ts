import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NORTUS_API_URL, NORTUS_COOKIE } from '@/lib/env';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(NORTUS_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch(`${NORTUS_API_URL}/nortus-v1/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const body = await res.text();

  return new NextResponse(body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('content-type') ?? 'application/json; charset=utf-8',
    },
  });
}
