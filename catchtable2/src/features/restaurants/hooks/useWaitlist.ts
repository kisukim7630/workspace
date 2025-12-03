"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {
  WaitlistListResponseSchema,
  WaitlistResponseSchema,
  type WaitlistResponse,
} from "@/features/restaurants/lib/dto";

const fetchWaitlist = async (): Promise<WaitlistResponse[]> => {
  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Authentication required");
    }

    const { data } = await apiClient.get("/api/waitlist", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    return WaitlistListResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      "Failed to fetch waitlist.",
    );
    throw new Error(message);
  }
};

export const useWaitlist = () =>
  useQuery({
    queryKey: ["waitlist"],
    queryFn: fetchWaitlist,
    staleTime: 30 * 1000,
  });

export const useCreateWaitlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      restaurantId: string;
      guests: number;
      phone?: string;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.post("/api/waitlist", data, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      return WaitlistResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
};

