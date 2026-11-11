import { Router } from 'express';
import { createCommentSchema } from '@writers-place/shared';
import type { Includeable } from 'sequelize';
import { Comment, User } from '../models/index.js';
import { requireArticle } from '../util/articleLookup.js';
import { requireAuth } from '../util/auth.js';

const commentsRouter = Router({ mergeParams: true });
const lookupArticle = requireArticle('articleId', { attributes: ['id'] });
const authorInclude: Includeable = {
  model: User,
  as: 'user',
  attributes: ['id', 'username', 'name', 'avatarUrl'],
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
