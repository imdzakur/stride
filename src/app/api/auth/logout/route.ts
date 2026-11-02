import { clearSessionCookie } from '@/server/auth/session-cookie';
import { withGuard } from '@/server/guard';
import { jsonOk } from '@/server/http';

export const POST = withGuard(async () => {
  const response = jsonOk({ ok: true });
  clearSessionCookie(response);
  // Clears the browser HTTP cache for this origin; the menu preference cookie stays.
  response.headers.set('Clear-Site-Data', '"cache"');
  return response;
});
