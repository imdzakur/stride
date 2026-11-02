import { NextResponse, type NextRequest } from 'next/server';
import { isSlug } from '@/shared/schemas';
import {
  AREA_SLUGS,
  areaFromLegacyKey,
  areaFromSlug,
  isSystemArea,
  isTrack,
} from '@/shared/tracks';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';
import { isValidSessionToken } from '@/server/auth/session-check';
import { isMobileRequest } from '@/server/device';

const NO_STORE = { 'Cache-Control': 'no-store' };

function apiError(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

function redirectTo(request: NextRequest, pathname: string, status = 307): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  return NextResponse.redirect(url, status);
}

const APP_PAGES = new Set(['/', '/dashboard']);

// loading.tsx streams pages with status 200 before notFound() can change it,
// so unknown routes are answered with 404 here. Track pages may be followed by a
// topic slug and a section slug; whether those exist is checked after DeviceGate.
// System maps have a single page each.
function isKnownPage(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  if (APP_PAGES.has(normalized)) return true;
  const [slug = '', ...rest] = normalized.slice(1).split('/');
  const area = areaFromSlug(slug);
  if (!area) return false;
  if (isSystemArea(area)) return rest.length === 0;
  return isTrack(area) && rest.length <= 2 && rest.every(isSlug);
}

// Old short paths such as /se/java move to the readable path /software-engineering/java.
function legacyPath(pathname: string): string | null {
  const [first = '', ...rest] = pathname.slice(1).split('/');
  const area = areaFromLegacyKey(first);
  if (!area || AREA_SLUGS[area] === first) return null;
  return ['', AREA_SLUGS[area], ...rest].join('/');
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
  const moved = legacyPath(pathname);
  if (moved) return redirectTo(request, moved, 308);
  if (!isKnownPage(pathname)) return notFoundPage(request);
  return NextResponse.next();
}

export const config = {
  // Brand assets must load on the sign-in page, before any session exists.
  matcher: ['/((?!_next/static|_next/image|stride-brand-kit/).*)'],
};
