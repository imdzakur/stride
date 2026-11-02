import { topicOrderSchema } from '@/shared/schemas';
import { withGuard } from '@/server/guard';
import { jsonOk, readJson } from '@/server/http';
import { orderTopics } from '@/server/services/tree-service';

// Saves the order of the topics in one track.
export const PATCH = withGuard(async (request) => {
  const input = topicOrderSchema.parse(await readJson(request));
  await orderTopics(input.track, input.ids);
  return jsonOk({ ok: true });
});
