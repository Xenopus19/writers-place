import { z } from 'zod';

export const ImageUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileType: z.string().regex(/^image\/[a-z0-9.+-]+$/i, 'Only image types are allowed'),
});

export type ImageUploadInput = z.infer<typeof ImageUploadSchema>;
