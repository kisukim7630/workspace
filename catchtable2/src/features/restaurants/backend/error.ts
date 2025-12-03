export const restaurantErrorCodes = {
  fetchError: "RESTAURANT_FETCH_ERROR",
  notFound: "RESTAURANT_NOT_FOUND",
  validationError: "RESTAURANT_VALIDATION_ERROR",
  createError: "RESTAURANT_CREATE_ERROR",
  updateError: "RESTAURANT_UPDATE_ERROR",
  deleteError: "RESTAURANT_DELETE_ERROR",
} as const;

type RestaurantErrorValue = (typeof restaurantErrorCodes)[keyof typeof restaurantErrorCodes];

export type RestaurantServiceError = RestaurantErrorValue;

