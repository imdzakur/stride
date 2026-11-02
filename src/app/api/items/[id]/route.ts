import { itemUpdateSchema } from '@/shared/schemas';
import { parseRouteId } from '@/server/route-id';
import { withGuard } from '@/server/guard';
import { jsonOk, readJson } from '@/server/http';
import { tickItem } from '@/server/services/tree-service';

type Params = { id: string };

// The only write the app makes: tick or untick one item.
export const PATCH = withGuard<Params>(async (request, { params }) => {
  const id = await parseRouteId(params, 'Invalid item ID.');
  const input = itemUpdateSchema.parse(await readJson(request));
  return jsonOk({ item: await tickItem(id, input.done) });
});
