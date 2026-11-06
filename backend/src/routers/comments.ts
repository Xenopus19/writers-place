import { Router } from 'express';
import type { Includeable } from 'sequelize';
import { Comment, User } from '../models/index.js';
import { createCommentSchema } from '../schemas/commentSchema.js';
import { requireArticle } from '../util/articleLookup.js';
import { requireAuth } from '../util/auth.js';

const commentsRouter = Router({ mergeParams: true });
const lookupArticle = requireArticle('articleId', { attributes: ['id'] });
const authorInclude: Includeable = {
  model: User,
  as: 'user',
  attributes: ['id', 'username', 'name', 'avatarUrl'],
};

commentsRouter.get('/', lookupArticle, async (req, res) => {
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

commentsRouter.post('/', requireAuth, lookupArticle, async (req, res) => {
  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default commentsRouter;
