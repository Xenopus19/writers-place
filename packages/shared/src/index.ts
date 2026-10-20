import { z } from 'zod';

export const baseSignUpSchema = z.object({
  username: z.string().trim().min(3).max(32),
  name: z.string().trim().min(1).max(100),
  about: z.string().max(1000).optional(),
  password: z.string().min(5).max(72),
});

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Article<T> {
  data: T;
  error?: string;
}
