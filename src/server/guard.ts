import type { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './auth/session';
import { getEnv } from './env';
import { errors } from './errors';
import { toErrorResponse } from './http';

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

export function requireSameOrigin(request: NextRequest): void {
  if (!MUTATION_METHODS.has(request.method)) return;
  const origin = request.headers.get('origin');
  if (!origin || origin !== getEnv().appOrigin) throw errors.forbiddenOrigin();
}

export function requireSession(request: NextRequest): void {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token, getEnv().sessionSecret)) throw errors.unauthorized();
}

type RouteContext<P> = { params: Promise<P> };

type Handler<P> = (request: NextRequest, context: RouteContext<P>) => Promise<NextResponse>;

// The proxy already checks the session, but every route handler checks it again.
export function withGuard<P = Record<string, never>>(
  handler: Handler<P>,
  options: { auth: boolean } = { auth: true },
): Handler<P> {
  return async (request, context) => {
    try {
      requireSameOrigin(request);
      if (options.auth) requireSession(request);
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
