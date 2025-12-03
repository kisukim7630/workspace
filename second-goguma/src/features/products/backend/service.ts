import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  ProductResponseSchema,
  ProductTableRowSchema,
  type CreateProductRequest,
  type ProductResponse,
  type ProductRow,
} from '@/features/products/backend/schema';
import {
  productErrorCodes,
  type ProductServiceError,
} from '@/features/products/backend/error';

const PRODUCTS_TABLE = 'products';

export const createProduct = async (
  client: SupabaseClient,
  userId: string,
  request: CreateProductRequest,
): Promise<HandlerResult<ProductResponse, ProductServiceError, unknown>> => {
  const { data, error } = await client
    .from(PRODUCTS_TABLE)
    .insert({
      user_id: userId,
      title: request.title,
      description: request.description ?? null,
      price: request.price,
      category: request.category,
      location: request.location,
      image_urls: request.imageUrls,
      status: 'active',
    })
    .select('id, user_id, title, description, price, category, location, image_urls, status, created_at, updated_at')
    .single<ProductRow>();

  if (error) {
    return failure(500, productErrorCodes.createError, error.message);
  }

  if (!data) {
    return failure(500, productErrorCodes.createError, 'Failed to create product.');
  }

  const rowParse = ProductTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return failure(
      500,
      productErrorCodes.validationError,
      'Product row failed validation.',
      rowParse.error.format(),
    );
  }

  const mapped = {
    id: rowParse.data.id,
    userId: rowParse.data.user_id,
    title: rowParse.data.title,
    description: rowParse.data.description,
    price: rowParse.data.price,
    category: rowParse.data.category,
    location: rowParse.data.location,
    imageUrls: rowParse.data.image_urls,
    status: rowParse.data.status,
    createdAt: rowParse.data.created_at,
    updatedAt: rowParse.data.updated_at,
  } satisfies ProductResponse;

  const parsed = ProductResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      productErrorCodes.validationError,
      'Product payload failed validation.',
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

