/**
 * Códigos de error observados en ErrorHandler / AuthMiddleware / validateRequest.
 * Fuente: docs/frontend/backend-contract.md — no inventar códigos adicionales.
 */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INSUFFICIENT_FUNDS'
  | 'INVALID_AMOUNT'
  | 'ACCOUNT_FROZEN'
  | 'DOMAIN_VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'INVALID_TOKEN'
  | 'INVALID_CREDENTIALS'
  | 'USER_ALREADY_EXISTS'
  | 'DUPLICATE_FIELD'
  | 'ACCOUNT_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'RESOURCE_NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR';

export interface FieldValidationError {
  readonly field: string;
  readonly message: string;
}

export class AppError extends Error {
  readonly code: ApiErrorCode | 'UNKNOWN';
  readonly statusHttp: number;
  readonly fieldErrors: ReadonlyArray<FieldValidationError>;

  constructor(params: {
    code: ApiErrorCode | 'UNKNOWN';
    message: string;
    statusHttp: number;
    fieldErrors?: ReadonlyArray<FieldValidationError>;
  }) {
    super(params.message);
    this.name = 'AppError';
    this.code = params.code;
    this.statusHttp = params.statusHttp;
    this.fieldErrors = params.fieldErrors ?? [];
  }
}
