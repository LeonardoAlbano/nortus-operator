import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = process.env.NORTUS_COOKIE ?? 'nortus_token';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/forget-password') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.');

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (pathname.startsWith('/login')) {
    if (token) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isPublic) return NextResponse.next();

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/simulator/:path*',
    '/tickets/:path*',
    '/user/:path*',
    '/login',
  ],
};
