import type { Hono } from "hono";
import {
  failure,
  respond,
  type ErrorResult,
} from "@/backend/http/response";
import {
  getLogger,
  getSupabase,
  getCurrentUser,
  type AppEnv,
} from "@/backend/hono/context";
import {
  RestaurantParamsSchema,
  RestaurantQuerySchema,
  CreateReservationSchema,
  CreateWaitlistSchema,
} from "@/features/restaurants/backend/schema";
import {
  getRestaurants,
  getRestaurantById,
  getRestaurantMenus,
  getRestaurantReviews,
  createReservation,
  getReservations,
  createWaitlist,
  getWaitlist,
} from "./service";
import {
  restaurantErrorCodes,
  type RestaurantServiceError,
} from "./error";

// Helper function to convert numeric ID to UUID format
// Supports both old format (00000000-0000-0000-0000-000000000002) and new hash-based format
const normalizeRestaurantId = (id: string): string => {
  // Check if it's already a UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  
  // Check if it's a numeric string (for backward compatibility with mock data)
  const numericId = parseInt(id, 10);
  if (!isNaN(numericId) && numericId > 0) {
    // Use simple format for backward compatibility with existing data
    // Format: 00000000-0000-0000-0000-00000000000X (supports up to 12 hex digits = 16^12)
    // For larger numbers, we could use hash, but for now keep it simple
    const hexId = numericId.toString(16).padStart(12, '0');
    return `00000000-0000-0000-0000-${hexId}`;
  }
  
  return id;
};

export const registerRestaurantRoutes = (app: Hono<AppEnv>) => {
  app.get("/api/restaurants", async (c) => {
    const queryParams = c.req.query();
    const parsedQuery = RestaurantQuerySchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      return respond(
        c,
        failure(
          400,
          "INVALID_RESTAURANT_QUERY",
          "Invalid query parameters.",
          parsedQuery.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getRestaurants(supabase, parsedQuery.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<RestaurantServiceError, unknown>;
      logger.error("Failed to fetch restaurants", errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // 더 구체적인 라우트를 먼저 등록해야 함
  app.get("/api/restaurants/:id/reviews", async (c) => {
    const rawId = c.req.param("id");
    const normalizedId = normalizeRestaurantId(rawId);
    const logger = getLogger(c);
    logger.info("Fetching restaurant reviews", { rawId, normalizedId });
    
    const parsedParams = RestaurantParamsSchema.safeParse({
      id: normalizedId,
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          "INVALID_RESTAURANT_PARAMS",
          "The provided restaurant id is invalid.",
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);

    const result = await getRestaurantReviews(supabase, parsedParams.data.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<RestaurantServiceError, unknown>;
      logger.error("Failed to fetch restaurant reviews", errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  app.get("/api/restaurants/:id/menus", async (c) => {
    const rawId = c.req.param("id");
    const normalizedId = normalizeRestaurantId(rawId);
    const logger = getLogger(c);
    logger.info("Fetching restaurant menus", { rawId, normalizedId });
    
    const parsedParams = RestaurantParamsSchema.safeParse({
      id: normalizedId,
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          "INVALID_RESTAURANT_PARAMS",
          "The provided restaurant id is invalid.",
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);

    const result = await getRestaurantMenus(supabase, parsedParams.data.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<RestaurantServiceError, unknown>;
      logger.error("Failed to fetch restaurant menus", errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // 가장 구체적인 라우트를 먼저 등록하고, 마지막에 일반적인 라우트 등록
  app.get("/api/restaurants/:id", async (c) => {
    const rawId = c.req.param("id");
    const logger = getLogger(c);
    const normalizedId = normalizeRestaurantId(rawId);
    
    logger.info("Restaurant ID request", { id: rawId, normalizedId });

    const parsedParams = RestaurantParamsSchema.safeParse({
      id: normalizedId,
    });

    if (!parsedParams.success) {
      logger.error("Invalid restaurant ID format", {
        id: rawId,
        errors: parsedParams.error.format(),
      });
      return respond(
        c,
        failure(
          400,
          "INVALID_RESTAURANT_PARAMS",
          "The provided restaurant id is invalid. Expected UUID format.",
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);

    const result = await getRestaurantById(supabase, parsedParams.data.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<RestaurantServiceError, unknown>;
      logger.error("Failed to fetch restaurant", errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  app.post("/api/reservations", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) {
      return respond(
        c,
        failure(401, "UNAUTHORIZED", "Authentication required."),
      );
    }

    const body = await c.req.json();
    const parsedBody = CreateReservationSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          "INVALID_RESERVATION_DATA",
          "Invalid reservation data.",
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await createReservation(supabase, user.id, {
      restaurantId: parsedBody.data.restaurantId,
      reservationDate: parsedBody.data.reservationDate,
      reservationTime: parsedBody.data.reservationTime,
      guests: parsedBody.data.guests,
      specialRequests: parsedBody.data.specialRequests,
    });

    if (!result.ok) {
      const errorResult = result as ErrorResult<RestaurantServiceError, unknown>;
      logger.error("Failed to create reservation", errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  app.get("/api/reservations", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) {
      return respond(
        c,
        failure(401, "UNAUTHORIZED", "Authentication required."),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getReservations(supabase, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<RestaurantServiceError, unknown>;
      logger.error("Failed to fetch reservations", errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  app.post("/api/waitlist", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) {
      return respond(
        c,
        failure(401, "UNAUTHORIZED", "Authentication required."),
      );
    }

    const body = await c.req.json();
    const parsedBody = CreateWaitlistSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          "INVALID_WAITLIST_DATA",
          "Invalid waitlist data.",
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await createWaitlist(supabase, user.id, {
      restaurantId: parsedBody.data.restaurantId,
      guests: parsedBody.data.guests,
      phone: parsedBody.data.phone,
    });

    if (!result.ok) {
      const errorResult = result as ErrorResult<RestaurantServiceError, unknown>;
      logger.error("Failed to create waitlist", errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  app.get("/api/waitlist", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) {
      return respond(
        c,
        failure(401, "UNAUTHORIZED", "Authentication required."),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getWaitlist(supabase, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<RestaurantServiceError, unknown>;
      logger.error("Failed to fetch waitlist", errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });
};

