import { Router } from 'express';
import { ImageUploadSchema } from '../schemas/imageUploadSchema.js';
import { getUploadUrl } from '../util/s3.js';

const imagesRouter = Router();

imagesRouter.post('/', async (req, res, next) => {
  const parsed = ImageUploadSchema.safeParse(req.body);
  if (!parsed.success) {
    next(parsed.error);
    return;
  }

  try {
    const safeName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const data = await getUploadUrl(safeName, parsed.data.fileType);
    res.status(201).json({ ...data });
  } catch (error) {
    next(error);
  }
});

export default imagesRouter;
