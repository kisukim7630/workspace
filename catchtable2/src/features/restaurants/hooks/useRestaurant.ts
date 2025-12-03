"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import {
  RestaurantResponseSchema,
  type RestaurantResponse,
} from "@/features/restaurants/lib/dto";

const fetchRestaurant = async (id: string): Promise<RestaurantResponse> => {
  try {
    const { data } = await apiClient.get(`/api/restaurants/${id}`);
    return RestaurantResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      "Failed to fetch restaurant.",
    );
    throw new Error(message);
  }
};

export const useRestaurant = (id: string) =>
  useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => fetchRestaurant(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });

