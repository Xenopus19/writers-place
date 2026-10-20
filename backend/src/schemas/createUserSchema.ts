import { z } from 'zod';
import { baseSignUpSchema } from '@writers-place/shared';

export const createUserSchema = baseSignUpSchema.extend({
  avatarUrl: z.url(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
