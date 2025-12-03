import { z } from "zod";

export const RestaurantParamsSchema = z.object({
  id: z.string().refine(
    (val) => {
      // Allow UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(val)) {
        return true;
      }
      // Allow numeric string (for backward compatibility with mock data)
      const numericId = parseInt(val, 10);
      return !isNaN(numericId) && numericId > 0;
    },
    { message: "Restaurant id must be a valid UUID or positive numeric string." }
  ),
});

export const RestaurantQuerySchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  cuisine: z.string().optional(),
  priceRange: z.string().optional(),
  menu: z.string().optional(),
});

export const RestaurantResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  location: z.string(),
  cuisine: z.string(),
  priceRange: z.string(),
  rating: z.number(),
  reviewCount: z.number(),
  phone: z.string().nullable(),
  hours: z.string().nullable(),
  address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  distanceKm: z.number().nullable(),
  ownerId: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const RestaurantListResponseSchema = z.object({
  restaurants: z.array(RestaurantResponseSchema),
  total: z.number(),
});

export const RestaurantMenuSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  name: z.string(),
  price: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const RestaurantMenuListResponseSchema = z.array(RestaurantMenuSchema);

export const RestaurantReviewSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  userEmail: z.string().nullable(),
});

export const RestaurantReviewListResponseSchema = z.array(RestaurantReviewSchema);

export const CreateReservationSchema = z.object({
  restaurantId: z.string().uuid(),
  reservationDate: z.string().date(),
  reservationTime: z.string().regex(/^\d{2}:\d{2}$/),
  guests: z.number().int().min(1),
  specialRequests: z.string().optional(),
});

export const ReservationResponseSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  userId: z.string().uuid(),
  reservationDate: z.string(),
  reservationTime: z.string(),
  guests: z.number(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  specialRequests: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  restaurantName: z.string().nullable(),
  restaurantImageUrl: z.string().nullable(),
  restaurantLocation: z.string().nullable(),
});

export const ReservationListResponseSchema = z.array(ReservationResponseSchema);

export const CreateWaitlistSchema = z.object({
  restaurantId: z.string().uuid(),
  guests: z.number().int().min(1),
  phone: z.string().optional(),
});

export const WaitlistResponseSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  userId: z.string().uuid(),
  queueNumber: z.number(),
  guests: z.number(),
  status: z.enum(["waiting", "next", "called", "cancelled"]),
  estimatedWaitMinutes: z.number().nullable(),
  phone: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  restaurantName: z.string().nullable(),
  restaurantImageUrl: z.string().nullable(),
  restaurantLocation: z.string().nullable(),
  restaurantPhone: z.string().nullable(),
});

export const WaitlistListResponseSchema = z.array(WaitlistResponseSchema);

export type RestaurantResponse = z.infer<typeof RestaurantResponseSchema>;
export type RestaurantListResponse = z.infer<typeof RestaurantListResponseSchema>;
export type RestaurantMenu = z.infer<typeof RestaurantMenuSchema>;
export type RestaurantReview = z.infer<typeof RestaurantReviewSchema>;
export type ReservationResponse = z.infer<typeof ReservationResponseSchema>;
export type WaitlistResponse = z.infer<typeof WaitlistResponseSchema>;

export const RestaurantTableRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  location: z.string(),
  cuisine: z.string(),
  price_range: z.string(),
  rating: z.union([z.number(), z.string()]).nullable().transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === "string" ? parseFloat(val) : val;
  }),
  review_count: z.union([z.number(), z.string()]).nullable().transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === "string" ? parseInt(val, 10) : val;
  }),
  phone: z.string().nullable(),
  hours: z.string().nullable(),
  address: z.string().nullable(),
  latitude: z.union([z.number(), z.string()]).nullable().transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === "string" ? parseFloat(val) : val;
  }),
  longitude: z.union([z.number(), z.string()]).nullable().transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === "string" ? parseFloat(val) : val;
  }),
  distance_km: z.union([z.number(), z.string()]).nullable().transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === "string" ? parseFloat(val) : val;
  }),
  owner_id: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type RestaurantTableRow = z.infer<typeof RestaurantTableRowSchema>;

