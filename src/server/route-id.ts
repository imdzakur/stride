import { uuidSchema } from '@/shared/schemas';
import { errors } from './errors';

export async function parseRouteId(
  params: Promise<{ id: string }>,
  message: string,
): Promise<string> {
  const result = uuidSchema.safeParse((await params).id);
  if (!result.success) throw errors.validation(message);
  return result.data.toLowerCase();
}
