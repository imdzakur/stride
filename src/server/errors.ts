export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly headers: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errors = {
  validation: (message: string) => new AppError(400, 'validation_error', message),
  unauthorized: () => new AppError(401, 'unauthorized', 'Session is invalid. Sign in again.'),
  forbiddenOrigin: () => new AppError(403, 'origin_not_allowed', 'Request origin is not allowed.'),
  itemNotFound: () => new AppError(404, 'item_not_found', 'Item not found.'),
  invalidCredentials: () =>
    new AppError(401, 'invalid_credentials', 'Incorrect username or password.'),
  tooManyAttempts: () =>
    new AppError(429, 'too_many_attempts', 'Too many sign-in attempts. Try again in 15 minutes.', {
      'Retry-After': '900',
    }),
  unavailable: () =>
    new AppError(503, 'service_unavailable', 'A backing service is unavailable. Try again later.'),
  internal: () => new AppError(500, 'internal_error', 'Server error.'),
};

// Supabase/PostgREST errors travel up to the service layer; raw SQL messages never reach the UI.
export class DatabaseError extends Error {
  constructor(
    public readonly pgCode: string | undefined,
    public readonly pgMessage: string,
  ) {
    super('database_error');
    this.name = 'DatabaseError';
  }
}
