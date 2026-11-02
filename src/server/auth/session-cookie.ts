import type { NextResponse } from 'next/server';
import { getEnv } from '../env';
import { SESSION_COOKIE_NAME } from './session';

export function setSessionCookie(
  response: NextResponse,
  session: { token: string; maxAge: number; secure: boolean },
): void {
  response.cookies.set(SESSION_COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: session.secure,
    path: '/',
    maxAge: session.maxAge,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: getEnv().secureCookies,
    path: '/',
    maxAge: 0,
  });
}
