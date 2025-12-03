import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  getUserId,
  type AppEnv,
} from '@/backend/hono/context';
import { CreateProductRequestSchema } from '@/features/products/backend/schema';
import { createProduct } from './service';
import {
  productErrorCodes,
  type ProductServiceError,
} from './error';

export const registerProductRoutes = (app: Hono<AppEnv>) => {
  app.post('/products', async (c) => {
    const userId = getUserId(c);

    if (!userId) {
      return respond(
        c,
        failure(401, productErrorCodes.unauthorized, 'Authentication required.'),
      );
    }

    const body = await c.req.json();
    const parsedBody = CreateProductRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_PRODUCT_REQUEST',
          'The provided product data is invalid.',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await createProduct(supabase, userId, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ProductServiceError, unknown>;

      if (errorResult.error.code === productErrorCodes.createError) {
        logger.error('Failed to create product', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });
};

