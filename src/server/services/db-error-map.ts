import 'server-only';
import { DatabaseError, errors } from '../errors';

// Constraint and order errors become 400; everything else stays a DatabaseError (503).
export function mapDatabaseError(error: unknown): unknown {
  if (!(error instanceof DatabaseError)) return error;
  if (error.pgCode === '23514' || error.pgCode === '22P02') {
    return errors.validation('Invalid data.');
  }
  // Raised by reorder_topics and reorder_sections when the list is not the current set.
  if (error.pgCode === '22023') {
    return errors.validation('The order no longer matches. Reload and try again.');
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
