'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { ProductResponseSchema } from '@/features/products/lib/dto';
import type { ProductResponse } from '@/features/products/lib/dto';

export type CreateProductRequest = {
  title: string;
  description?: string;
  price: number;
  category: string;
  location: string;
  imageUrls?: string[];
};

const createProduct = async (request: CreateProductRequest): Promise<ProductResponse> => {
  try {
    const { data } = await apiClient.post('/api/products', {
      title: request.title,
      description: request.description,
      price: request.price,
      category: request.category,
      location: request.location,
      imageUrls: request.imageUrls ?? [],
    });
    return ProductResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, '상품 등록에 실패했습니다.');
    throw new Error(message);
  }
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

