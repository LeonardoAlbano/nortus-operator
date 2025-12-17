import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const locales = ['en', 'pt-BR'] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'pt-BR';

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { locale?: string };
  const nextLocale = body.locale && isLocale(body.locale) ? body.locale : defaultLocale;

  const store = await cookies();
  store.set('locale', nextLocale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ locale: nextLocale });
}
