import { NextResponse } from 'next/server';
import { z } from 'zod';
import { NORTUS_API_URL, NORTUS_COOKIE, sessionCookieOptions } from '@/lib/env';

const BodySchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

type LoginResponse = { access_token: string };

export async function POST(req: Request) {
  const body = BodySchema.parse(await req.json());

  const upstream = await fetch(`${NORTUS_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payloadText = await upstream.text();
  const payload = payloadText ? JSON.parse(payloadText) : null;

  if (!upstream.ok) {
    return NextResponse.json(payload ?? { message: 'Unauthorized' }, { status: upstream.status });
  }

  const data = payload as LoginResponse;

  const res = NextResponse.json({
    user: { name: body.email, email: body.email },
  });

  res.cookies.set(NORTUS_COOKIE, data.access_token, sessionCookieOptions());
  return res;
}
