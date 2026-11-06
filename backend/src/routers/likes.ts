import { Router } from 'express';
import { ArticleLike } from '../models/index.js';
import { requireArticle } from '../util/articleLookup.js';
import { requireAuth } from '../util/auth.js';

const likesRouter = Router({ mergeParams: true });
likesRouter.use(requireAuth);
likesRouter.use(requireArticle('articleId', { attributes: ['id'] }));

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
