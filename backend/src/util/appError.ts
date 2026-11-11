export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly errors?: Array<{ field: string; message: string }>;

  constructor(
    status: number, 
    code: string, 
    message: string, 
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }

  static badRequest(message: string, errors?: Array<{ field: string; message: string }>) {
    return new AppError(400, 'VALIDATION_ERROR', message, errors);
  }

  static conflict(message: string, errors?: Array<{ field: string; message: string }>) {
    return new AppError(409, 'RESOURCE_EXISTS', message, errors);
  }

  static notFound(message: string = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }
}