import { z } from 'zod';

export const CreateProductRequestSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자 이하여야 합니다.'),
  description: z.string().max(5000, '설명은 5000자 이하여야 합니다.').optional(),
  price: z.number().int().min(0, '가격은 0원 이상이어야 합니다.'),
  category: z.string().min(1, '카테고리를 선택해주세요.'),
  location: z.string().min(1, '거래 지역을 입력해주세요.'),
  imageUrls: z.array(z.string().url('올바른 이미지 URL이 아닙니다.')).max(10, '이미지는 최대 10개까지 등록할 수 있습니다.').default([]),
});

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

export const ProductResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  price: z.number().int(),
  category: z.string(),
  location: z.string(),
  imageUrls: z.array(z.string()),
  status: z.enum(['active', 'sold', 'reserved', 'deleted']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;

export const ProductTableRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  price: z.number().int(),
  category: z.string(),
  location: z.string(),
  image_urls: z.array(z.string()),
  status: z.enum(['active', 'sold', 'reserved', 'deleted']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProductRow = z.infer<typeof ProductTableRowSchema>;

