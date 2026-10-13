import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().trim().min(3).max(32),
  name: z.string().trim().min(1).max(100),
  about: z.string().max(1000).optional(),
  password: z.string().min(8).max(72),
  avatarUrl: z.url(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
