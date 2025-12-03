import type { SupabaseClient } from "@supabase/supabase-js";
import {
  failure,
  success,
  type HandlerResult,
} from "@/backend/http/response";
import {
  RestaurantResponseSchema,
  RestaurantListResponseSchema,
  RestaurantTableRowSchema,
  RestaurantMenuListResponseSchema,
  RestaurantReviewListResponseSchema,
  ReservationResponseSchema,
  ReservationListResponseSchema,
  WaitlistResponseSchema,
  WaitlistListResponseSchema,
  RestaurantMenuSchema,
  RestaurantReviewSchema,
  type RestaurantResponse,
  type RestaurantTableRow,
  type RestaurantMenu,
  type RestaurantReview,
  type ReservationResponse,
  type WaitlistResponse,
} from "@/features/restaurants/backend/schema";
import {
  restaurantErrorCodes,
  type RestaurantServiceError,
} from "@/features/restaurants/backend/error";

const RESTAURANTS_TABLE = "restaurants";
const RESTAURANT_MENUS_TABLE = "restaurant_menus";
const REVIEWS_TABLE = "reviews";
const RESERVATIONS_TABLE = "reservations";
const WAITLIST_TABLE = "waitlist";

const mapRestaurantRow = (row: RestaurantTableRow): RestaurantResponse => ({
  id: row.id,
  name: row.name,
  description: row.description,
  imageUrl: row.image_url,
  location: row.location,
  cuisine: row.cuisine,
  priceRange: row.price_range,
  rating: row.rating ?? 0,
  reviewCount: row.review_count ?? 0,
  phone: row.phone,
  hours: row.hours,
  address: row.address,
  latitude: row.latitude,
  longitude: row.longitude,
  distanceKm: row.distance_km,
  ownerId: row.owner_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getRestaurants = async (
  client: SupabaseClient,
  filters: {
    search?: string;
    location?: string;
    cuisine?: string;
    priceRange?: string;
    menu?: string;
  },
): Promise<
  HandlerResult<
    { restaurants: RestaurantResponse[]; total: number },
    RestaurantServiceError
  >
> => {
  let query = client.from(RESTAURANTS_TABLE).select("*", { count: "exact" });

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`,
    );
  }

  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  if (filters.cuisine) {
    query = query.eq("cuisine", filters.cuisine);
  }

  if (filters.priceRange) {
    query = query.eq("price_range", filters.priceRange);
  }

  if (filters.menu) {
    const { data: menuData } = await client
      .from(RESTAURANT_MENUS_TABLE)
      .select("restaurant_id")
      .ilike("name", `%${filters.menu}%`);

    if (menuData && menuData.length > 0) {
      const restaurantIds = menuData.map((m) => m.restaurant_id);
      query = query.in("id", restaurantIds);
    } else {
      return success({ restaurants: [], total: 0 });
    }
  }

  const { data, error, count } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    return failure(500, restaurantErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return success({ restaurants: [], total: 0 });
  }

  const rows = data.map((row) => RestaurantTableRowSchema.parse(row));
  const restaurants = rows.map(mapRestaurantRow);

  // 디버깅: 첫 번째 레스토랑의 ID 확인
  if (restaurants.length > 0) {
    console.log("First restaurant ID:", restaurants[0].id, "Type:", typeof restaurants[0].id);
  }

  const parsed = RestaurantListResponseSchema.safeParse({
    restaurants,
    total: count ?? 0,
  });

  if (!parsed.success) {
    return failure(
      500,
      restaurantErrorCodes.validationError,
      "Restaurant list failed validation.",
      parsed.error.format(),
    );
  }

  return success({
    restaurants: parsed.data.restaurants,
    total: parsed.data.total,
  });
};

export const getRestaurantById = async (
  client: SupabaseClient,
  id: string,
): Promise<HandlerResult<RestaurantResponse, RestaurantServiceError>> => {
  const { data, error } = await client
    .from(RESTAURANTS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle<RestaurantTableRow>();

  // Log for debugging
  if (error) {
    console.error("Error fetching restaurant by id:", id, error);
  } else if (!data) {
    console.warn("Restaurant not found with id:", id);
  }

  if (error) {
    return failure(500, restaurantErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return failure(404, restaurantErrorCodes.notFound, "Restaurant not found");
  }

  const rowParse = RestaurantTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return failure(
      500,
      restaurantErrorCodes.validationError,
      "Restaurant row failed validation.",
      rowParse.error.format(),
    );
  }

  const mapped = mapRestaurantRow(rowParse.data);
  const parsed = RestaurantResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      restaurantErrorCodes.validationError,
      "Restaurant payload failed validation.",
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

export const getRestaurantMenus = async (
  client: SupabaseClient,
  restaurantId: string,
): Promise<HandlerResult<RestaurantMenu[], RestaurantServiceError>> => {
  const { data, error } = await client
    .from(RESTAURANT_MENUS_TABLE)
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: true });

  if (error) {
    return failure(500, restaurantErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return success([]);
  }

  const parsed = RestaurantMenuListResponseSchema.safeParse(data);

  if (!parsed.success) {
    return failure(
      500,
      restaurantErrorCodes.validationError,
      "Restaurant menus failed validation.",
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

export const getRestaurantReviews = async (
  client: SupabaseClient,
  restaurantId: string,
): Promise<HandlerResult<RestaurantReview[], RestaurantServiceError>> => {
  // Note: We cannot join auth.users directly via PostgREST
  // So we fetch reviews without user email and set it to null
  const { data, error } = await client
    .from(REVIEWS_TABLE)
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) {
    return failure(500, restaurantErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return success([]);
  }

  const reviews = data.map((review: any) => ({
    id: review.id,
    restaurantId: review.restaurant_id,
    userId: review.user_id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
    updatedAt: review.updated_at,
    userEmail: null, // auth.users cannot be joined directly via PostgREST
  }));

  const parsed = RestaurantReviewListResponseSchema.safeParse(reviews);

  if (!parsed.success) {
    return failure(
      500,
      restaurantErrorCodes.validationError,
      "Restaurant reviews failed validation.",
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

export const createReservation = async (
  client: SupabaseClient,
  userId: string,
  data: {
    restaurantId: string;
    reservationDate: string;
    reservationTime: string;
    guests: number;
    specialRequests?: string;
  },
): Promise<HandlerResult<ReservationResponse, RestaurantServiceError>> => {
  const { data: reservation, error } = await client
    .from(RESERVATIONS_TABLE)
    .insert({
      restaurant_id: data.restaurantId,
      user_id: userId,
      reservation_date: data.reservationDate,
      reservation_time: data.reservationTime,
      guests: data.guests,
      special_requests: data.specialRequests ?? null,
      status: "pending",
    })
    .select(
      `
      *,
      restaurant:restaurant_id (
        name,
        image_url,
        location
      )
    `,
    )
    .single();

  if (error) {
    return failure(500, restaurantErrorCodes.createError, error.message);
  }

  const mapped = {
    id: reservation.id,
    restaurantId: reservation.restaurant_id,
    userId: reservation.user_id,
    reservationDate: reservation.reservation_date,
    reservationTime: reservation.reservation_time,
    guests: reservation.guests,
    status: reservation.status,
    specialRequests: reservation.special_requests,
    createdAt: reservation.created_at,
    updatedAt: reservation.updated_at,
    restaurantName: (reservation.restaurant as any)?.name ?? null,
    restaurantImageUrl: (reservation.restaurant as any)?.image_url ?? null,
    restaurantLocation: (reservation.restaurant as any)?.location ?? null,
  };

  const parsed = ReservationResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      restaurantErrorCodes.validationError,
      "Reservation failed validation.",
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

export const getReservations = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<ReservationResponse[], RestaurantServiceError>> => {
  const { data, error } = await client
    .from(RESERVATIONS_TABLE)
    .select(
      `
      *,
      restaurant:restaurant_id (
        name,
        image_url,
        location
      )
    `,
    )
    .eq("user_id", userId)
    .order("reservation_date", { ascending: false })
    .order("reservation_time", { ascending: false });

  if (error) {
    return failure(500, restaurantErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return success([]);
  }

  const reservations = data.map((reservation: any) => ({
    id: reservation.id,
    restaurantId: reservation.restaurant_id,
    userId: reservation.user_id,
    reservationDate: reservation.reservation_date,
    reservationTime: reservation.reservation_time,
    guests: reservation.guests,
    status: reservation.status,
    specialRequests: reservation.special_requests,
    createdAt: reservation.created_at,
    updatedAt: reservation.updated_at,
    restaurantName: reservation.restaurant?.name ?? null,
    restaurantImageUrl: reservation.restaurant?.image_url ?? null,
    restaurantLocation: reservation.restaurant?.location ?? null,
  }));

  const parsed = ReservationListResponseSchema.safeParse(reservations);

  if (!parsed.success) {
    return failure(
      500,
      restaurantErrorCodes.validationError,
      "Reservations failed validation.",
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

export const createWaitlist = async (
  client: SupabaseClient,
  userId: string,
  data: {
    restaurantId: string;
    guests: number;
    phone?: string;
  },
): Promise<HandlerResult<WaitlistResponse, RestaurantServiceError>> => {
  const { count } = await client
    .from(WAITLIST_TABLE)
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", data.restaurantId)
    .eq("status", "waiting");

  const queueNumber = (count ?? 0) + 1;
  const estimatedWaitMinutes = queueNumber * 10;

  const { data: waitlist, error } = await client
    .from(WAITLIST_TABLE)
    .insert({
      restaurant_id: data.restaurantId,
      user_id: userId,
      queue_number: queueNumber,
      guests: data.guests,
      phone: data.phone ?? null,
      status: "waiting",
      estimated_wait_minutes: estimatedWaitMinutes,
    })
    .select(
      `
      *,
      restaurant:restaurant_id (
        name,
        image_url,
        location,
        phone
      )
    `,
    )
    .single();

  if (error) {
    return failure(500, restaurantErrorCodes.createError, error.message);
  }

  const mapped = {
    id: waitlist.id,
    restaurantId: waitlist.restaurant_id,
    userId: waitlist.user_id,
    queueNumber: waitlist.queue_number,
    guests: waitlist.guests,
    status: waitlist.status,
    estimatedWaitMinutes: waitlist.estimated_wait_minutes,
    phone: waitlist.phone,
    createdAt: waitlist.created_at,
    updatedAt: waitlist.updated_at,
    restaurantName: (waitlist.restaurant as any)?.name ?? null,
    restaurantImageUrl: (waitlist.restaurant as any)?.image_url ?? null,
    restaurantLocation: (waitlist.restaurant as any)?.location ?? null,
    restaurantPhone: (waitlist.restaurant as any)?.phone ?? null,
  };

  const parsed = WaitlistResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      restaurantErrorCodes.validationError,
      "Waitlist failed validation.",
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

export const getWaitlist = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<WaitlistResponse[], RestaurantServiceError>> => {
  const { data, error } = await client
    .from(WAITLIST_TABLE)
    .select(
      `
      *,
      restaurant:restaurant_id (
        name,
        image_url,
        location,
        phone
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return failure(500, restaurantErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return success([]);
  }

  const waitlist = data.map((item: any) => ({
    id: item.id,
    restaurantId: item.restaurant_id,
    userId: item.user_id,
    queueNumber: item.queue_number,
    guests: item.guests,
    status: item.status,
    estimatedWaitMinutes: item.estimated_wait_minutes,
    phone: item.phone,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    restaurantName: item.restaurant?.name ?? null,
    restaurantImageUrl: item.restaurant?.image_url ?? null,
    restaurantLocation: item.restaurant?.location ?? null,
    restaurantPhone: item.restaurant?.phone ?? null,
  }));

  const parsed = WaitlistListResponseSchema.safeParse(waitlist);

  if (!parsed.success) {
    return failure(
      500,
      restaurantErrorCodes.validationError,
      "Waitlist failed validation.",
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

