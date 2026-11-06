import { Router } from 'express';
import type { Includeable } from 'sequelize';
import { Article, Genre } from '../models/index.js';
import {
  createArticleSchema,
  listArticlesSchema,
  searchArticlesSchema,
  updateArticleSchema,
} from '../schemas/articleSchema.js';
import { requireAuth } from '../util/auth.js';
import { getLikesCounts } from '../util/articleLikes.js';
import {
  embedArticle,
  embedQuery,
  findNearestArticles,
} from '../util/embeddings.js';

const articlesRouter = Router();

const genreInclude: Includeable = {
  model: Genre,
  as: 'genres',
  attributes: ['name'],
  through: { attributes: [] },
};

const serverError = (res: import('express').Response, error: unknown) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
};

const genreNames = (genres: Genre[] | undefined): string[] =>
  (genres ?? []).map((genre) => genre.name).sort();

const toArticleJson = (article: Article) => {
  const { embedding: _omit, ...data } = article.toJSON();
  return { ...data, genres: genreNames(article.genres) };
};

const findGenresByName = async (names: string[]) => {
  const uniqueNames = [...new Set(names)];
  
  const rows = await Genre.findAll({ where: { name: uniqueNames } });
  const found = new Set(rows.map((genre) => genre.name));
  const unknown = uniqueNames.filter((name) => !found.has(name));
  return { rows, unknown };
};

articlesRouter.get('/', async (req, res) => {
  const parsed = listArticlesSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  try {
    const { genre } = parsed.data;
    let idFilter: string[] | undefined;
    if (genre) {
      const genreRow = await Genre.findOne({
        where: { name: genre },
        include: [
          {
            model: Article,
            as: 'articles',
            attributes: ['id'],
            through: { attributes: [] },
          },
        ],
      });
      if (!genreRow) {
        res.json([]);
        return;
      }
      idFilter = (genreRow.articles ?? []).map((article) => article.id);
    }

    const articles = await Article.findAll({
      where: idFilter ? { id: idFilter } : undefined,
      include: [genreInclude],
      order: [['createdAt', 'DESC']],
    });
    const likesCounts = await getLikesCounts(articles.map((article) => article.id));
    res.json(
      articles.map((article) => ({
        ...toArticleJson(article),
        likesCount: likesCounts.get(article.id) ?? 0,
      }))
    );
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
    if (articles.length === 0) {
      res.json([]);
      return;
    }

    const withGenres = await Article.findAll({
      where: { id: articles.map((article) => article.id) },
      include: [genreInclude],
    });
    const byId = new Map(withGenres.map((article) => [article.id, article]));
    const likesCounts = await getLikesCounts(withGenres.map((article) => article.id));
    const ordered = articles.flatMap((article) => {
      const full = byId.get(article.id);
      return full
        ? [{ ...toArticleJson(full), likesCount: likesCounts.get(full.id) ?? 0 }]
        : [];
    });
    res.json(ordered);
  } catch (error) {
    serverError(res, error);
  }
});

articlesRouter.get('/:id', async (req, res) => {
  try {
    const article = await Article.findByPk(String(req.params.id), {
      include: [genreInclude],
    });
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    const likesCounts = await getLikesCounts([article.id]);
    res.json({ ...toArticleJson(article), likesCount: likesCounts.get(article.id) ?? 0 });
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
    const { genres, ...articleData } = parsed.data;
    const { rows, unknown } = await findGenresByName(genres);
    if (unknown.length > 0) {
      res.status(400).json({ error: `Unknown genres: ${unknown.join(', ')}` });
      return;
    }

    const { id: userId } = req.tokenUser;
    const embedding = await embedArticle(articleData);
    const created = await Article.create({ ...articleData, userId, embedding });
    await created.setGenres(rows);
    const { embedding: _omit, ...data } = created.toJSON();
    res.status(201).json({ data: { ...data, genres: genreNames(rows) } });
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
    const article = await Article.findByPk(String(req.params.id), {
      include: [genreInclude],
    });
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    if (article.userId !== req.tokenUser.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { genres, ...updates } = parsed.data;
    if (genres !== undefined) {
      const { rows, unknown } = await findGenresByName(genres);
      if (unknown.length > 0) {
        res.status(400).json({ error: `Unknown genres: ${unknown.join(', ')}` });
        return;
      }
      await article.setGenres(rows);
      article.genres = rows;
    }

    if (Object.keys(updates).length === 0) {
      res.json({ data: toArticleJson(article) });
      return;
    }

    const hasEmbeddingInputChanged =
      (updates.title !== undefined && updates.title !== article.title) ||
      (updates.description !== undefined &&
        updates.description !== article.description);

    if (!hasEmbeddingInputChanged) {
      const updated = await article.update(updates);
      res.json({ data: toArticleJson(updated) });
      return;
    }

    const merged = {
      title: updates.title ?? article.title,
      description: updates.description ?? article.description,
      text: updates.text ?? article.text,
    };

    const embedding = await embedArticle(merged);
    const updated = await article.update({ ...merged, embedding });
    res.json({ data: toArticleJson(updated) });
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
