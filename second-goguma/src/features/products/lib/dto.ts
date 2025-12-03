import { z } from 'zod';

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

