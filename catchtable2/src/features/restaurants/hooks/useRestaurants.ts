"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import {
  RestaurantListResponseSchema,
  type RestaurantListResponse,
} from "@/features/restaurants/lib/dto";

type RestaurantFilters = {
  search?: string;
  location?: string;
  cuisine?: string;
  priceRange?: string;
};

const fetchRestaurants = async (
  filters: RestaurantFilters,
): Promise<RestaurantListResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.location) params.append("location", filters.location);
    if (filters.cuisine) params.append("cuisine", filters.cuisine);
    if (filters.priceRange) params.append("priceRange", filters.priceRange);

    const { data } = await apiClient.get(
      `/api/restaurants?${params.toString()}`,
    );
    return RestaurantListResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      "Failed to fetch restaurants.",
    );
    throw new Error(message);
  }
};

export const useRestaurants = (filters: RestaurantFilters = {}) =>
  useQuery({
    queryKey: ["restaurants", filters],
    queryFn: () => fetchRestaurants(filters),
    staleTime: 60 * 1000,
  });

