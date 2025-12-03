"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import {
  RestaurantMenuListResponseSchema,
  type RestaurantMenu,
} from "@/features/restaurants/lib/dto";

const fetchRestaurantMenus = async (
  restaurantId: string,
): Promise<RestaurantMenu[]> => {
  try {
    const { data } = await apiClient.get(
      `/api/restaurants/${restaurantId}/menus`,
    );
    return RestaurantMenuListResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      "Failed to fetch restaurant menus.",
    );
    throw new Error(message);
  }
};

export const useRestaurantMenus = (restaurantId: string) =>
  useQuery({
    queryKey: ["restaurant-menus", restaurantId],
    queryFn: () => fetchRestaurantMenus(restaurantId),
    enabled: Boolean(restaurantId),
    staleTime: 60 * 1000,
  });

