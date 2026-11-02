import 'server-only';
import { DatabaseError, errors } from '../errors';

// Constraint errors become 400; everything else stays a DatabaseError and maps to 503.
export function mapDatabaseError(error: unknown): unknown {
  if (!(error instanceof DatabaseError)) return error;
  if (error.pgCode === '23514' || error.pgCode === '22P02') {
    return errors.validation('Invalid data.');
  }
  return error;
}

export async function withDbErrors<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw mapDatabaseError(error);
  }
}
