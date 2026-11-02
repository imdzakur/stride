import { NextResponse, type NextRequest } from 'next/server';
import { isSlug } from '@/shared/schemas';
import { isSystemArea, isTrack } from '@/shared/tracks';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';
import { isValidSessionToken } from '@/server/auth/session-check';
import { isMobileRequest } from '@/server/device';

const NO_STORE = { 'Cache-Control': 'no-store' };

function apiError(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  return NextResponse.redirect(url);
}

const APP_PAGES = new Set(['/', '/dashboard']);

// loading.tsx streams pages with status 200 before notFound() can change it,
// so unknown routes are answered with 404 here. Track pages may be followed by a
// topic slug and a section slug; whether those exist is checked after DeviceGate.
// System maps have a single page each.
function isKnownPage(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  if (APP_PAGES.has(normalized)) return true;
  const [area = '', ...rest] = normalized.slice(1).split('/');
  if (isSystemArea(area)) return rest.length === 0;
  return isTrack(area) && rest.length <= 2 && rest.every(isSlug);
}

function notFoundPage(request: NextRequest): NextResponse {
  return NextResponse.rewrite(new URL('/_not-found', request.url), {
    status: 404,
    headers: NO_STORE,
  });
}

// First-pass check only. Route handlers and the internal layout verify the session again.
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');

  if (isMobileRequest(request.headers)) {
    if (isApi) {
      return apiError(403, 'device_blocked', 'Stride only works on a laptop or desktop.');
    }
    return pathname === '/blocked' ? NextResponse.next() : redirectTo(request, '/blocked');
  }
  if (pathname === '/blocked') return NextResponse.next();

  const authed = isValidSessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname === '/login') {
    return authed ? redirectTo(request, '/dashboard') : NextResponse.next();
  }
  if (isApi) {
    if (pathname === '/api/auth/login' || authed) return NextResponse.next();
    return apiError(401, 'unauthorized', 'Session is invalid. Sign in again.');
  }
  if (!authed) return redirectTo(request, '/login');
  if (!isKnownPage(pathname)) return notFoundPage(request);
  return NextResponse.next();
}

export const config = {
  // Brand assets must load on the sign-in page, before any session exists.
  matcher: ['/((?!_next/static|_next/image|stride-brand-kit/).*)'],
};
