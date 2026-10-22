import { Router } from 'express';
import { Article } from '../models/index.js';
import {
  createArticleSchema,
  searchArticlesSchema,
  updateArticleSchema,
} from '../schemas/articleSchema.js';
import { requireAuth } from '../util/auth.js';
import {
  embedArticle,
  embedQuery,
  findNearestArticles,
} from '../util/embeddings.js';

const articlesRouter = Router();

const serverError = (res: import('express').Response, error: unknown) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
};

articlesRouter.get('/', async (_req, res) => {
  try {
    const articles = await Article.findAll({ order: [['createdAt', 'DESC']] });
    res.json(articles);
  } catch (error) {
    serverError(res, error);
  }
});

articlesRouter.get('/search', async (req, res) => {
  const parsed = searchArticlesSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  try {
    const vector = await embedQuery(parsed.data.q);
    const articles = await findNearestArticles(vector, parsed.data.limit);
    res.json(articles);
  } catch (error) {
    serverError(res, error);
  }
});

articlesRouter.get('/:id', async (req, res) => {
  try {
    const article = await Article.findByPk(String(req.params.id));
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json(article);
  } catch (error) {
    serverError(res, error);
  }
});

articlesRouter.post('/', requireAuth, async (req, res) => {
  const parsed = createArticleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  try {
    const { id: userId } = req.tokenUser;
    const embedding = await embedArticle(parsed.data);
    const created = await Article.create({ ...parsed.data, userId, embedding });
    const { embedding: _omit, ...data } = created.toJSON();
    res.status(201).json({ data });
  } catch (error) {
    serverError(res, error);
  }
});

articlesRouter.put('/:id', requireAuth, async (req, res) => {
  const parsed = updateArticleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  try {
    const article = await Article.findByPk(String(req.params.id));
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    if (article.userId !== req.tokenUser.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const hasEmbeddingInputChanged =
      (parsed.data.title !== undefined && parsed.data.title !== article.title) ||
      (parsed.data.description !== undefined &&
        parsed.data.description !== article.description);

    if (!hasEmbeddingInputChanged) {
      const updated = await article.update(parsed.data);
      const { embedding: _omit, ...data } = updated.toJSON();
      res.json({ data });
      return;
    }

    const merged = {
      title: parsed.data.title ?? article.title,
      description: parsed.data.description ?? article.description,
      text: parsed.data.text ?? article.text,
    };

    const embedding = await embedArticle(merged);
    const updated = await article.update({ ...merged, embedding });
    const { embedding: _omit, ...data } = updated.toJSON();
    res.json({ data });
  } catch (error) {
    serverError(res, error);
  }
});

articlesRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const article = await Article.findByPk(String(req.params.id));
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    if (article.userId !== req.tokenUser.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    await article.destroy();
    res.status(204).end();
  } catch (error) {
    serverError(res, error);
  }
});

export default articlesRouter;
