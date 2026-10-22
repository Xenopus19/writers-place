import { z } from 'zod';

export const createArticleSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(500),
  text: z.string().min(1),
});

export const searchArticlesSchema = z.object({
  q: z.string().trim().min(1).max(500),
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

export const updateArticleSchema = createArticleSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'No fields to update');
