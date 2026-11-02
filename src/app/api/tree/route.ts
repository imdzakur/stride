import { withGuard } from '@/server/guard';
import { jsonOk } from '@/server/http';
import { getTree } from '@/server/services/tree-service';

export const GET = withGuard(async () => jsonOk(await getTree()));
