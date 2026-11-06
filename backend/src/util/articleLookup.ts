import type { RequestHandler } from 'express';
import type { Attributes, FindOptions } from 'sequelize';
import { z } from 'zod';
import { Article } from '../models/index.js';

declare module 'express-serve-static-core' {
  interface Request {
    article: Article;
  }
}

const articleIdSchema = z.uuid();

export const requireArticle =
  (
    param: 'id' | 'articleId',
    options: Pick<
      FindOptions<Attributes<Article>>,
      'attributes' | 'include'
    > = {}
  ): RequestHandler =>
  async (req, res, next) => {
    const parsed = articleIdSchema.safeParse(req.params[param]);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }

    try {
      const article = await Article.findByPk(parsed.data, options);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      req.article = article;
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
