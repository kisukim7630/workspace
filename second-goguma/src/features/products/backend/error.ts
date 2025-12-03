export const productErrorCodes = {
  notFound: 'PRODUCT_NOT_FOUND',
  createError: 'PRODUCT_CREATE_ERROR',
  validationError: 'PRODUCT_VALIDATION_ERROR',
  unauthorized: 'PRODUCT_UNAUTHORIZED',
} as const;

type ProductErrorValue = (typeof productErrorCodes)[keyof typeof productErrorCodes];

export type ProductServiceError = ProductErrorValue;

