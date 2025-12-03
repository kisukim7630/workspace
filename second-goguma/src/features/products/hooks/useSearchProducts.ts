'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  SearchProductsResponseSchema,
  type SearchProductsQuery,
} from '@/features/products/backend/schema';

const fetchSearchProducts = async (query: SearchProductsQuery) => {
  try {
    const params = new URLSearchParams();

    if (query.q) {
      params.set('q', query.q);
    }
    if (query.category) {
      params.set('category', query.category);
    }
    if (query.location) {
      params.set('location', query.location);
    }
    params.set('sort', query.sort);
    params.set('page', query.page.toString());
    params.set('limit', query.limit.toString());

    const { data } = await apiClient.get(`/api/products/search?${params.toString()}`);
    return SearchProductsResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, '상품 검색에 실패했습니다.');
    throw new Error(message);
  }
};

export const useSearchProducts = (query: SearchProductsQuery) =>
  useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => fetchSearchProducts(query),
    staleTime: 30 * 1000,
  });

