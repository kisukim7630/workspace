"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {
  ReservationListResponseSchema,
  ReservationResponseSchema,
  type ReservationResponse,
} from "@/features/restaurants/lib/dto";

const fetchReservations = async (): Promise<ReservationResponse[]> => {
  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Authentication required");
    }

    const { data } = await apiClient.get("/api/reservations", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    return ReservationListResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      "Failed to fetch reservations.",
    );
    throw new Error(message);
  }
};

export const useReservations = () =>
  useQuery({
    queryKey: ["reservations"],
    queryFn: fetchReservations,
    staleTime: 30 * 1000,
  });

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      restaurantId: string;
      reservationDate: string;
      reservationTime: string;
      guests: number;
      specialRequests?: string;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.post("/api/reservations", data, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      return ReservationResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
};

