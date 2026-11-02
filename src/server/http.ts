import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { firstIssueMessage } from '@/shared/schemas';
import { AppError, DatabaseError, errors } from './errors';
import { EnvError } from './env';

export const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' } as const;

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: NO_STORE_HEADERS });
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  headers: Record<string, string> = {},
): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { ...NO_STORE_HEADERS, ...headers } },
  );
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return jsonError(error.status, error.code, error.message, error.headers);
  }
  if (error instanceof ZodError) {
    return jsonError(400, 'validation_error', firstIssueMessage(error));
  }
  if (error instanceof EnvError) {
    // Variable names may appear in server logs; values may not.
    console.error(error.message);
    const unavailable = errors.unavailable();
    return jsonError(unavailable.status, unavailable.code, unavailable.message);
  }
  if (error instanceof DatabaseError) {
    console.error('database_error', error.pgCode ?? 'unknown');
    const unavailable = errors.unavailable();
    return jsonError(unavailable.status, unavailable.code, unavailable.message);
  }
  console.error('unhandled_error', error instanceof Error ? error.name : 'unknown');
  const internal = errors.internal();
  return jsonError(internal.status, internal.code, internal.message);
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw errors.validation('Request body must be JSON.');
  }
}
