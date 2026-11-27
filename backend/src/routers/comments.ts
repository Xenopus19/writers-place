import { Router, type RequestHandler } from 'express';
import {
  createCommentSchema,
  updateCommentSchema,
} from '@writers-place/shared';
import type { Includeable } from 'sequelize';
import { z } from 'zod';
import { Comment, User } from '../models/index.js';
import { requireArticle } from '../util/articleLookup.js';
import { AppError } from '../util/appError.js';
import { requireAuth } from '../util/auth.js';

const commentsRouter = Router({ mergeParams: true });
const lookupArticle = requireArticle('articleId', { attributes: ['id'] });
const commentIdSchema = z.uuid();
const authorInclude: Includeable = {
  model: User,
  as: 'user',
  attributes: ['id', 'username', 'name', 'avatarUrl'],
};

declare module 'express-serve-static-core' {
  interface Request {
    comment: Comment;
  }
}

const lookupComment: RequestHandler = async (req, _res, next) => {
  const parsed = commentIdSchema.safeParse(req.params.commentId);
  if (!parsed.success) {
    next(parsed.error);
    return;
  }

  try {
    const comment = await Comment.findOne({
      where: { id: parsed.data, articleId: req.article.id },
    });
    if (!comment) {
      next(AppError.notFound('Comment not found'));
      return;
    }
    req.comment = comment;
    next();
  } catch (error) {
    next(error);
  }
};

commentsRouter.get('/', lookupArticle, async (req, res, next) => {
  try {
    const comments = await Comment.findAll({
      where: { articleId: req.article.id },
      include: [authorInclude],
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    res.json(comments);
  } catch (error) {
    next(error);
  }
});

commentsRouter.put(
  '/:commentId',
  requireAuth,
  lookupArticle,
  lookupComment,
  async (req, res, next) => {
    const parsed = updateCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }

    try {
      if (req.comment.userId !== req.tokenUser.id) {
        next(new AppError(403, 'FORBIDDEN', 'Forbidden'));
        return;
      }

      await req.comment.update({ text: parsed.data.text });
      const comment = await Comment.findByPk(req.comment.id, {
        include: [authorInclude],
      });
      if (!comment) {
        throw new Error('Updated comment could not be loaded');
      }
      res.json({ data: comment });
    } catch (error) {
      next(error);
    }
  },
);

commentsRouter.delete(
  '/:commentId',
  requireAuth,
  lookupArticle,
  lookupComment,
  async (req, res, next) => {
    try {
      if (req.comment.userId !== req.tokenUser.id) {
        next(new AppError(403, 'FORBIDDEN', 'Forbidden'));
        return;
      }

      await req.comment.destroy();
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);

commentsRouter.post('/', requireAuth, lookupArticle, async (req, res, next) => {
  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    next(parsed.error);
    return;
  }

  try {
    const created = await Comment.create({
      articleId: req.article.id,
      userId: req.tokenUser.id,
      text: parsed.data.text,
    });
    const comment = await Comment.findByPk(created.id, {
      include: [authorInclude],
    });
    if (!comment) {
      throw new Error('Created comment could not be loaded');
    }
    res.status(201).json({ data: comment });
  } catch (error) {
    next(error);
  }
});

export default commentsRouter;
