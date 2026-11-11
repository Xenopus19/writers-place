import type { RequestHandler } from 'express';
import type { Attributes, FindOptions } from 'sequelize';
import { z } from 'zod';
import { Article } from '../models/index.js';
import { AppError } from './appError.js';

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
  async (req, _res, next) => {
    const parsed = articleIdSchema.safeParse(req.params[param]);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }

    try {
      const article = await Article.findByPk(parsed.data, options);
      if (!article) {
        next(AppError.notFound('Article not found'));
        return;
      }
      req.article = article;
      next();
    } catch (error) {
      next(error);
    }
  };
