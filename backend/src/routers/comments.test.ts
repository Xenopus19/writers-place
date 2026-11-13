import express, { type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findOne: vi.fn(),
  findByPk: vi.fn(),
}));

vi.mock('../models/index.js', () => ({
  Comment: class CommentModel {
    static findOne = mocks.findOne;
    static findByPk = mocks.findByPk;
  },
  User: class UserModel {},
}));

vi.mock('../util/articleLookup.js', () => ({
  requireArticle: () => (req: Request, _res: Response, next: NextFunction) => {
    Object.assign(req, { article: { id: 'article-1' } });
    next();
  },
}));

vi.mock('../util/auth.js', () => ({
  requireAuth: (req: Request, _res: Response, next: NextFunction) => {
    Object.assign(req, {
      tokenUser: { id: req.header('x-user-id') ?? 'user-1' },
    });
    next();
  },
}));

import { Comment } from '../models/index.js';
import commentsRouter from './comments.js';
import { errorHandler } from '../util/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/articles/:articleId/comments', commentsRouter);
app.use(errorHandler);

const commentId = 'c0ffee00-0000-4000-8000-000000000001';

describe('comment update and delete routes', () => {
  let comment: Comment;

  beforeEach(() => {
    vi.resetAllMocks();
    comment = Object.assign(new Comment(), {
      id: commentId,
      articleId: 'article-1',
      userId: 'user-1',
      text: 'Original comment',
      update: vi.fn(async ({ text }: { text: string }) => {
        comment.text = text;
        return comment;
      }),
      destroy: vi.fn(),
    });
    mocks.findOne.mockResolvedValue(comment);
    mocks.findByPk.mockResolvedValue(comment);
  });

  it('updates a comment owned by the authenticated user', async () => {
    const response = await request(app)
      .put(`/articles/article-1/comments/${commentId}`)
      .send({ text: '  Edited comment  ' });

    expect(response.status).toBe(200);
    expect(response.body.data.text).toBe('Edited comment');
    expect(comment.update).toHaveBeenCalledWith({ text: 'Edited comment' });
    expect(mocks.findOne).toHaveBeenCalledWith({
      where: { id: commentId, articleId: 'article-1' },
    });
  });

  it('rejects edits by a different user', async () => {
    const response = await request(app)
      .put(`/articles/article-1/comments/${commentId}`)
      .set('x-user-id', 'user-2')
      .send({ text: 'Not allowed' });

    expect(response.status).toBe(403);
    expect(comment.update).not.toHaveBeenCalled();
  });

  it('rejects invalid edits without updating the comment', async () => {
    const response = await request(app)
      .put(`/articles/article-1/comments/${commentId}`)
      .send({ text: '   ' });

    expect(response.status).toBe(400);
    expect(comment.update).not.toHaveBeenCalled();
  });

  it('permanently deletes a comment owned by the authenticated user', async () => {
    const response = await request(app)
      .delete(`/articles/article-1/comments/${commentId}`);

    expect(response.status).toBe(204);
    expect(comment.destroy).toHaveBeenCalledOnce();
  });

  it('rejects deletion by a different user', async () => {
    const response = await request(app)
      .delete(`/articles/article-1/comments/${commentId}`)
      .set('x-user-id', 'user-2');

    expect(response.status).toBe(403);
    expect(comment.destroy).not.toHaveBeenCalled();
  });
});
