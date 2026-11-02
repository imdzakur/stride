import { sectionOrderSchema } from '@/shared/schemas';
import { withGuard } from '@/server/guard';
import { jsonOk, readJson } from '@/server/http';
import { orderSections } from '@/server/services/tree-service';

// Saves the order of the sections in one topic.
export const PATCH = withGuard(async (request) => {
  const input = sectionOrderSchema.parse(await readJson(request));
  await orderSections(input.topicId, input.ids);
  return jsonOk({ ok: true });
});
