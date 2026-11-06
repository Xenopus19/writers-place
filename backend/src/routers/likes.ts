import { Router } from 'express';
import { z } from 'zod';
import { Article, ArticleLike } from '../models/index.js';
import { requireAuth } from '../util/auth.js';

const likesRouter = Router({ mergeParams: true });
const articleIdSchema = z.uuid();

likesRouter.use(requireAuth);

likesRouter.use(async (req, res, next) => {
  const parsed = articleIdSchema.safeParse(req.params.articleId);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  try {
    const article = await Article.findByPk(parsed.data, { attributes: ['id'] });
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

likesRouter.post<{ articleId: string }>('/', async (req, res) => {
  try {
    const articleId = String(req.params.articleId);
    await ArticleLike.bulkCreate([{ articleId, userId: req.tokenUser.id }], {
      ignoreDuplicates: true,
    });
    const likesCount = await ArticleLike.count({ where: { articleId } });
    res.json({ likesCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

likesRouter.delete<{ articleId: string }>('/', async (req, res) => {
  try {
    const articleId = String(req.params.articleId);
    await ArticleLike.destroy({
      where: { articleId, userId: req.tokenUser.id },
    });
    const likesCount = await ArticleLike.count({ where: { articleId } });
    res.json({ likesCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default likesRouter;
