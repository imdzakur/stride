import { loginSchema } from '@/shared/schemas';
import { setSessionCookie } from '@/server/auth/session-cookie';
import { withGuard } from '@/server/guard';
import { jsonOk, readJson } from '@/server/http';
import { login } from '@/server/services/auth-service';

export const POST = withGuard(
  async (request) => {
    const input = loginSchema.parse(await readJson(request));
    const session = await login(input.username, input.password, request.headers);
    const response = jsonOk({ ok: true });
    setSessionCookie(response, session);
    return response;
  },
  { auth: false },
);
