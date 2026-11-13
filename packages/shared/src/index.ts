import { z } from 'zod';

export interface ApiFieldError {
  field: string;
  message: string;
}

export type ApiErrorCode = 
  | 'VALIDATION_ERROR'
  | 'RESOURCE_EXISTS'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'INTERNAL_SERVER_ERROR'
  |'FORBIDDEN'
  | 'INVALID_CREDENTIALS'
  | 'REQUEST_SETUP_ERROR'
  | 'NETWORK_ERROR'

export interface ApiErrorResponse {
  status: number;
  code: ApiErrorCode;
  message: string;
  errors?: ApiFieldError[];
}

export const baseSignUpSchema = z.object({
  username: z.string().trim().min(3).max(32),
  name: z.string().trim().min(1).max(100),
  about: z.string().max(1000).optional(),
  password: z.string().min(5).max(72),
});

export const createCommentSchema = z.object({
  text: z.string().trim().min(1, 'Enter a comment.').max(150, 'Comments must be at most 150 characters.'),
});

export type CreateComment = z.infer<typeof createCommentSchema>;
export const updateCommentSchema = createCommentSchema;
export type UpdateComment = z.infer<typeof updateCommentSchema>;

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Article<T> {
  data: T;
  error?: string;
}
