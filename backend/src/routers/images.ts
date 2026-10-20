import { Router } from 'express';
import { ImageUploadSchema } from '../schemas/imageUploadSchema.js';
import { getUploadUrl } from '../util/s3.js';

const imagesRouter = Router();

imagesRouter.post('/', async (req, res) => {
  const parsed = ImageUploadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  try {
    const safeName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const data = await getUploadUrl(safeName, parsed.data.fileType);
    res.status(201).json({ ...data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default imagesRouter;
