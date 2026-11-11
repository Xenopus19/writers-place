import { ApiErrorCode, ApiFieldError } from "@writers-place/shared";

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorCode;
  public readonly errors?: Array<ApiFieldError>;

  constructor(
    status: number, 
    code: ApiErrorCode, 
    message: string, 
    errors?: Array<ApiFieldError>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }

  static badRequest(message: string, errors?: Array<ApiFieldError>) {
    return new AppError(400, 'VALIDATION_ERROR', message, errors);
  }

  static conflict(message: string, errors?: Array<ApiFieldError>) {
    return new AppError(409, 'RESOURCE_EXISTS', message, errors);
  }

  static notFound(message: string = 'Resource not found', errors?: Array<ApiFieldError>) {
    return new AppError(404, 'NOT_FOUND', message, errors);
  }
}