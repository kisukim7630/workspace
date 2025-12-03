import { createMiddleware } from 'hono/factory';
import {
  contextKeys,
  type AppEnv,
} from '@/backend/hono/context';
import { getSupabase } from '@/backend/hono/context';

export const withAuth = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await next();
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabase(c);

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        c.set(contextKeys.userId, user.id);
      }
    } catch (error) {
      // 인증 실패 시 userId를 설정하지 않음
    }

    await next();
  });

