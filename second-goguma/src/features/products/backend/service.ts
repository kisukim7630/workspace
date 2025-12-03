import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  ProductResponseSchema,
  ProductTableRowSchema,
  SearchProductsResponseSchema,
  type CreateProductRequest,
  type ProductResponse,
  type ProductRow,
  type SearchProductsResponse,
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

export const searchProducts = async (
  client: SupabaseClient,
  query: {
    q?: string;
    category?: string;
    location?: string;
    sort: 'latest' | 'popular' | 'price-low' | 'price-high';
    page: number;
    limit: number;
  },
): Promise<HandlerResult<SearchProductsResponse, ProductServiceError, unknown>> => {
  let supabaseQuery = client
    .from(PRODUCTS_TABLE)
    .select('id, user_id, title, description, price, category, location, image_urls, status, created_at, updated_at', { count: 'exact' })
    .eq('status', 'active');

  if (query.q) {
    const searchTerm = `%${query.q}%`;
    supabaseQuery = supabaseQuery.or(
      `title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`
    );
  }

  if (query.category) {
    supabaseQuery = supabaseQuery.eq('category', query.category);
  }

  if (query.location) {
    supabaseQuery = supabaseQuery.eq('location', query.location);
  }

  switch (query.sort) {
    case 'latest':
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      break;
    case 'price-low':
      supabaseQuery = supabaseQuery.order('price', { ascending: true });
      break;
    case 'price-high':
      supabaseQuery = supabaseQuery.order('price', { ascending: false });
      break;
    case 'popular':
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      break;
  }

  const from = (query.page - 1) * query.limit;
  const to = from + query.limit - 1;

  supabaseQuery = supabaseQuery.range(from, to);

  const { data, error, count } = await supabaseQuery.returns<ProductRow[]>();

  if (error) {
    return failure(500, productErrorCodes.searchError, error.message);
  }

  if (!data) {
    return failure(500, productErrorCodes.searchError, 'Failed to search products.');
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / query.limit);

  const mappedProducts = data.map((row) => {
    const rowParse = ProductTableRowSchema.safeParse(row);

    if (!rowParse.success) {
      return null;
    }

    return {
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
    };
  }).filter((product): product is ProductResponse => product !== null);

  const parsedProducts = mappedProducts.map((product) =>
    ProductResponseSchema.safeParse(product)
  ).filter((result): result is z.SafeParseSuccess<ProductResponse> => result.success);

  if (parsedProducts.length !== mappedProducts.length) {
    return failure(
      500,
      productErrorCodes.validationError,
      'Some products failed validation.',
    );
  }

  const response: SearchProductsResponse = {
    products: parsedProducts.map((result) => result.data),
    total,
    page: query.page,
    limit: query.limit,
    totalPages,
  };

  const parsed = SearchProductsResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      productErrorCodes.validationError,
      'Search response failed validation.',
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

