"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import {
  RestaurantReviewListResponseSchema,
  type RestaurantReview,
} from "@/features/restaurants/lib/dto";

const fetchRestaurantReviews = async (
  restaurantId: string,
): Promise<RestaurantReview[]> => {
  try {
    const { data } = await apiClient.get(
      `/api/restaurants/${restaurantId}/reviews`,
    );
    return RestaurantReviewListResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      "Failed to fetch restaurant reviews.",
    );
    throw new Error(message);
  }
};

export const useRestaurantReviews = (restaurantId: string) =>
  useQuery({
    queryKey: ["restaurant-reviews", restaurantId],
    queryFn: () => fetchRestaurantReviews(restaurantId),
    enabled: Boolean(restaurantId),
    staleTime: 60 * 1000,
  });

