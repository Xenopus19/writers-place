import { type ApiErrorCode, type ApiFieldError, type ApiErrorResponse } from "@writers-place/shared";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorCode;
  public readonly errors?: ApiFieldError[];

  constructor(data: ApiErrorResponse) {
    super(data.message);
    this.name = 'ApiError';
    this.status = data.status;
    this.code = data.code;
    this.errors = data.errors;
  }

  public getFieldError(fieldName: string): string | undefined {
    return this.errors?.find((e) => e.field === fieldName)?.message;
  }
}