import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UniqueConstraintError, ValidationErrorItem } from 'sequelize';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  articleFindAll: vi.fn(),
  articleFindByPk: vi.fn(),
  articleCreate: vi.fn(),
  genreFindAll: vi.fn(),
  userFindByPk: vi.fn(),
  userFindOne: vi.fn(),
  userCreate: vi.fn(),
  commentFindAll: vi.fn(),
  commentCreate: vi.fn(),
  likeBulkCreate: vi.fn(),
  likeDestroy: vi.fn(),
  getUploadUrl: vi.fn(),
  embedArticle: vi.fn(),
  embedQuery: vi.fn(),
}));

vi.mock('../src/models/index.js', () => ({
  Article: {
    findAll: mocks.articleFindAll,
    findByPk: mocks.articleFindByPk,
    create: mocks.articleCreate,
  },
  Genre: { findAll: mocks.genreFindAll },
  User: {
    findByPk: mocks.userFindByPk,
    create: mocks.userCreate,
    scope: () => ({ findOne: mocks.userFindOne }),
  },
  Comment: { findAll: mocks.commentFindAll, create: mocks.commentCreate },
  ArticleLike: { bulkCreate: mocks.likeBulkCreate, destroy: mocks.likeDestroy },
}));
vi.mock('../src/util/embeddings.js', () => ({
  embedArticle: mocks.embedArticle,
  embedQuery: mocks.embedQuery,
  findNearestArticles: vi.fn(),
}));
vi.mock('../src/util/articleLikes.js', () => ({ getLikesCounts: vi.fn() }));
vi.mock('../src/util/s3.js', () => ({ getUploadUrl: mocks.getUploadUrl }));

import { app } from '../src/app.js';
import { JWT_SECRET } from '../src/util/config.js';

const articleId = randomUUID();
const userId = randomUUID();
const token = jwt.sign({ id: userId, username: 'test' }, JWT_SECRET);
const authorization = `Bearer ${token}`;
const articleUrl = `/api/articles/${articleId}`;
const internalError = {
  status: 500,
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Internal server error',
};

describe('route error handling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.articleFindByPk.mockResolvedValue({ id: articleId, userId });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the validation error format across routes and article lookup', async () => {
    const responses = await Promise.all([
      request(app).get('/api/articles?genre='),
      request(app).get('/api/articles/search?q='),
      request(app).get('/api/articles/not-a-uuid'),
      request(app).post('/api/articles').set('Authorization', authorization).send({}),
      request(app).put(articleUrl).set('Authorization', authorization).send({}),
      request(app).post(`${articleUrl}/comments`).set('Authorization', authorization).send({}),
      request(app).post('/api/images').send({}),
      request(app).post('/api/users').send({}),
      request(app).post('/api/login').send({}),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: expect.any(String), message: expect.any(String) }),
        ]),
      });
    }
  });

  it('returns structured authentication, not-found, and forbidden errors', async () => {
    await request(app).get('/api/users/me').expect(401, {
      status: 401, code: 'UNAUTHORIZED', message: 'Token missing',
    });
    await request(app).get('/api/users/me').set('Authorization', 'Bearer invalid').expect(401, {
      status: 401, code: 'UNAUTHORIZED', message: 'Invalid token',
    });
    mocks.userFindByPk.mockResolvedValueOnce(null);
    await request(app).get('/api/users/me').set('Authorization', authorization).expect(404, {
      status: 404, code: 'NOT_FOUND', message: 'User not found',
    });
    mocks.articleFindByPk.mockResolvedValueOnce(null);
    await request(app).get(articleUrl).expect(404, {
      status: 404, code: 'NOT_FOUND', message: 'Article not found',
    });
    mocks.articleFindByPk.mockResolvedValue({ id: articleId, userId: randomUUID() });
    await request(app).put(articleUrl).set('Authorization', authorization).send({ text: 'updated' }).expect(403, {
      status: 403, code: 'FORBIDDEN', message: 'Forbidden',
    });
    await request(app).delete(articleUrl).set('Authorization', authorization).expect(403, {
      status: 403, code: 'FORBIDDEN', message: 'Forbidden',
    });
  });

  it('reports unknown genres using AppError for article creation and updates', async () => {
    mocks.genreFindAll.mockResolvedValue([]);
    await request(app).post('/api/articles').set('Authorization', authorization)
      .send({ title: 'Title', description: 'Description', text: 'Text', genres: ['Unknown'] })
      .expect(400, { status: 400, code: 'VALIDATION_ERROR', message: 'Unknown genres: Unknown' });
    await request(app).put(articleUrl).set('Authorization', authorization)
      .send({ genres: ['Unknown'] })
      .expect(400, { status: 400, code: 'VALIDATION_ERROR', message: 'Unknown genres: Unknown' });
  });

  it('handles invalid credentials without converting unexpected login failures to 400', async () => {
    mocks.userFindOne.mockResolvedValueOnce(null);
    await request(app).post('/api/login').send({ username: 'test', password: 'wrong' })
      .expect(400, { status: 400, code: 'INVALID_CREDENTIALS', message: 'Login error: User not found' });
    mocks.userFindOne.mockResolvedValueOnce({ passwordHash: await bcrypt.hash('correct', 4) });
    await request(app).post('/api/login').send({ username: 'test', password: 'wrong' })
      .expect(400, { status: 400, code: 'INVALID_CREDENTIALS', message: 'Login error: Invalid credentials.' });
    mocks.userFindOne.mockRejectedValueOnce(new Error('database details'));
    await request(app).post('/api/login').send({ username: 'test', password: 'wrong' })
      .expect(500, internalError);
  });

  it('forwards unique constraint errors to the central handler', async () => {
    mocks.userCreate.mockRejectedValueOnce(new UniqueConstraintError({
      errors: [new ValidationErrorItem('username must be unique', 'unique violation', 'username')],
    }));
    await request(app).post('/api/users').send({
      username: 'testuser', name: 'Test User', password: 'password123', avatarUrl: 'https://example.com/avatar.png',
    }).expect(409, {
      status: 409,
      code: 'RESOURCE_EXISTS',
      message: 'Resource already exists',
      errors: [{ field: 'username', message: 'username must be unique' }],
    });
  });

  it('forwards unexpected user creation errors', async () => {
    mocks.userCreate.mockRejectedValueOnce(new Error('database details'));
    await request(app).post('/api/users').send({
      username: 'testuser', name: 'Test User', password: 'password123', avatarUrl: 'https://example.com/avatar.png',
    }).expect(500, internalError);
    expect(console.error).toHaveBeenCalledOnce();
  });

  it('forwards unexpected errors from route handlers and lookup middleware', async () => {
    const failure = new Error('private failure details');
    mocks.articleFindAll.mockRejectedValueOnce(failure);
    mocks.embedQuery.mockRejectedValueOnce(failure);
    mocks.articleFindByPk.mockRejectedValueOnce(failure);
    mocks.genreFindAll.mockRejectedValueOnce(failure);
    mocks.getUploadUrl.mockRejectedValueOnce(failure);
    mocks.commentFindAll.mockRejectedValueOnce(failure);
    mocks.commentCreate.mockRejectedValueOnce(failure);
    mocks.likeBulkCreate.mockRejectedValueOnce(failure);
    mocks.likeDestroy.mockRejectedValueOnce(failure);
    mocks.userFindByPk.mockRejectedValueOnce(failure);

    await request(app).get('/api/articles').expect(500, internalError);
    await request(app).get('/api/articles/search?q=test').expect(500, internalError);
    await request(app).get(articleUrl).expect(500, internalError);
    await request(app).get('/api/genres').expect(500, internalError);
    await request(app).post('/api/images').send({ fileName: 'a.png', fileType: 'image/png' }).expect(500, internalError);
    await request(app).get(`${articleUrl}/comments`).expect(500, internalError);
    await request(app).post(`${articleUrl}/comments`).set('Authorization', authorization)
      .send({ text: 'comment' }).expect(500, internalError);
    await request(app).post(`${articleUrl}/likes`).set('Authorization', authorization).expect(500, internalError);
    await request(app).delete(`${articleUrl}/likes`).set('Authorization', authorization).expect(500, internalError);
    await request(app).get('/api/users/me').set('Authorization', authorization).expect(500, internalError);
    expect(console.error).toHaveBeenCalledTimes(10);
  });

  it('forwards unexpected errors during article writes', async () => {
    const failure = new Error('article write failed');
    mocks.genreFindAll.mockResolvedValue([]);
    mocks.embedArticle.mockRejectedValueOnce(failure);
    mocks.articleFindByPk.mockResolvedValueOnce({
      id: articleId, userId, title: 'old', description: 'description', update: vi.fn().mockRejectedValue(failure),
    });
    await request(app).put(articleUrl).set('Authorization', authorization)
      .send({ text: 'updated' }).expect(500, internalError);

    mocks.articleFindByPk.mockResolvedValueOnce({
      id: articleId, userId, destroy: vi.fn().mockRejectedValue(failure),
    });
    await request(app).delete(articleUrl).set('Authorization', authorization).expect(500, internalError);

    mocks.genreFindAll.mockResolvedValueOnce([{ name: 'Fiction' }]);
    await request(app).post('/api/articles').set('Authorization', authorization)
      .send({ title: 'Title', description: 'Description', text: 'Text', genres: ['Fiction'] })
      .expect(500, internalError);
    expect(console.error).toHaveBeenCalledTimes(3);
  });

  it('preserves successful login and route responses', async () => {
    mocks.userFindOne.mockResolvedValueOnce({
      id: userId, username: 'test', passwordHash: await bcrypt.hash('correct', 4),
    });
    const login = await request(app).post('/api/login')
      .send({ username: 'test', password: 'correct' }).expect(200);
    expect(login.body.user).toEqual({ id: userId, username: 'test' });
    expect(jwt.verify(login.body.token, JWT_SECRET)).toMatchObject({ id: userId, username: 'test' });

    mocks.genreFindAll.mockResolvedValueOnce([{ name: 'Fiction' }]);
    await request(app).get('/api/genres').expect(200, [{ name: 'Fiction' }]);
    mocks.getUploadUrl.mockResolvedValueOnce({ uploadUrl: 'https://example.com/upload', key: 'file' });
    await request(app).post('/api/images').send({ fileName: 'a.png', fileType: 'image/png' })
      .expect(201, { uploadUrl: 'https://example.com/upload', key: 'file' });
    mocks.userCreate.mockResolvedValueOnce({
      toJSON: () => ({ id: userId, username: 'testuser', passwordHash: 'secret' }),
    });
    await request(app).post('/api/users').send({
      username: 'testuser', name: 'Test User', password: 'password123', avatarUrl: 'https://example.com/avatar.png',
    }).expect(201, { data: { id: userId, username: 'testuser' } });
    mocks.articleFindByPk.mockResolvedValueOnce({ id: articleId, userId, destroy: vi.fn() });
    await request(app).delete(articleUrl).set('Authorization', authorization).expect(204);
  });
});
