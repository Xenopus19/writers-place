import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { DataTypes } from 'sequelize';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

vi.mock('../src/util/embeddings.js', () => ({
  embedArticle: vi.fn(async () => 'test embedding'),
  embedQuery: vi.fn(async () => [0]),
  findNearestArticles: vi.fn(),
}));

const databaseUrl = process.env.COMMENTS_TEST_DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;

describeDatabase('article comments', () => {
  let app: typeof import('../src/app.js').app;
  let Article: typeof import('../src/models/index.js').Article;
  let Comment: typeof import('../src/models/index.js').Comment;
  let Genre: typeof import('../src/models/index.js').Genre;
  let User: typeof import('../src/models/index.js').User;
  let sequelize: typeof import('../src/util/db.js').sequelize;
  let migration: typeof import('../src/migrations/zzz_comments.js');
  let jwtSecret: string;
  let ownsTables = false;
  let commentsCreated = false;
  const userIds = [randomUUID(), randomUUID()];
  const articleIds = [randomUUID(), randomUUID()];
  const url = (id: string) => `/api/articles/${id}/comments`;
  const auth = (index: number) =>
    `Bearer ${jwt.sign({ id: userIds[index], username: `comment-test-${index}` }, jwtSecret)}`;

  beforeAll(async () => {
    if (
      !databaseUrl ||
      databaseUrl !== process.env.DATABASE_URL ||
      new URL(databaseUrl).pathname !== '/writers_place_comments_test'
    ) {
      throw new Error(
        'Tests require an isolated writers_place_comments_test database'
      );
    }

    ({ app } = await import('../src/app.js'));
    ({ Article, Comment, Genre, User } =
      await import('../src/models/index.js'));
    ({ sequelize } = await import('../src/util/db.js'));
    ({ JWT_SECRET: jwtSecret } = await import('../src/util/config.js'));
    const { up: createUsers } =
      await import('../src/migrations/13102026_users.js');
    const { up: createGenres } =
      await import('../src/migrations/03112026_genres.js');
    const { up: createLikes } =
      await import('../src/migrations/zz_article_likes.js');
    migration = await import('../src/migrations/zzz_comments.js');

    const queryInterface = sequelize.getQueryInterface();
    if ((await queryInterface.showAllTables()).length > 0) {
      throw new Error(
        'Comments test database must not contain existing tables'
      );
    }
    ownsTables = true;
    await createUsers({ context: queryInterface });
    await queryInterface.createTable('articles', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: false },
      text: { type: DataTypes.TEXT, allowNull: false },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      embedding: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false },
    });
    await createGenres({ context: queryInterface });
    await createLikes({ context: queryInterface });
    await migration.up({ context: queryInterface });
    commentsCreated = true;

    for (let index = 0; index < userIds.length; index += 1) {
      await User.create({
        id: userIds[index],
        username: `comment-test-${index}`,
        name: `User ${index}`,
        passwordHash: 'test-hash',
        avatarUrl: `avatar-${index}`,
      });
      await Article.create({
        id: articleIds[index],
        userId: userIds[index],
        title: `Article ${index}`,
        description: `Description ${index}`,
        text: 'Article text',
      });
    }
    const genre = await Genre.findOne({ where: { name: 'Fiction' } });
    const article = await Article.findByPk(articleIds[0]);
    if (!genre || !article) throw new Error('Missing test genre or article');
    await article.setGenres([genre]);
  });

  beforeEach(async () => {
    await Comment.destroy({ where: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    if (commentsCreated) {
      await migration.down({ context: sequelize.getQueryInterface() });
    }
    if (ownsTables) {
      await sequelize.query(
        'DROP TABLE IF EXISTS comments, article_likes, article_genres, genres, articles, users'
      );
    }
    if (sequelize) await sequelize.close();
  });

  it('creates multiple comments per user and article and returns only public author fields', async () => {
    const first = await request(app)
      .post(url(articleIds[0]))
      .set('Authorization', auth(0))
      .send({ text: '  First comment  ', userId: userIds[1] })
      .expect(201);
    expect(first.body.data).toMatchObject({
      articleId: articleIds[0],
      userId: userIds[0],
      text: 'First comment',
      user: {
        id: userIds[0],
        username: 'comment-test-0',
        name: 'User 0',
        avatarUrl: 'avatar-0',
      },
    });
    expect(Object.keys(first.body.data.user).sort()).toEqual(
      ['id', 'username', 'name', 'avatarUrl'].sort()
    );
    expect(new Date(first.body.data.createdAt).toISOString()).toBe(
      first.body.data.createdAt
    );
    const second = await request(app)
      .post(url(articleIds[0]))
      .set('Authorization', auth(0))
      .send({ text: 'Second comment' })
      .expect(201);
    expect(second.body.data.id).not.toBe(first.body.data.id);
    await request(app)
      .post(url(articleIds[0]))
      .set('Authorization', auth(1))
      .send({ text: 'Another author' })
      .expect(201);
    await request(app)
      .post(url(articleIds[1]))
      .set('Authorization', auth(0))
      .send({ text: 'Another article' })
      .expect(201);

    const listed = await request(app).get(url(articleIds[0])).expect(200);
    expect(listed.body).toHaveLength(3);
    expect(listed.body).toContainEqual(first.body.data);
    expect(listed.body).toContainEqual(second.body.data);
    expect(await Comment.count({ where: { articleId: articleIds[1] } })).toBe(
      1
    );
  });

  it('returns an empty list and sorts comments newest first with a stable tie breaker', async () => {
    expect(
      (await request(app).get(url(articleIds[0])).expect(200)).body
    ).toEqual([]);
    const ids = [
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002',
      '00000000-0000-4000-8000-000000000003',
    ];
    await Comment.bulkCreate([
      {
        id: ids[0],
        articleId: articleIds[0],
        userId: userIds[0],
        text: 'old',
        createdAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        id: ids[1],
        articleId: articleIds[0],
        userId: userIds[0],
        text: 'new',
        createdAt: new Date('2024-02-01T00:00:00Z'),
      },
      {
        id: ids[2],
        articleId: articleIds[0],
        userId: userIds[1],
        text: 'new tie',
        createdAt: new Date('2024-02-01T00:00:00Z'),
      },
    ]);
    const response = await request(app).get(url(articleIds[0])).expect(200);
    expect(response.body.map((comment: { id: string }) => comment.id)).toEqual([
      ids[2],
      ids[1],
      ids[0],
    ]);
  });

  it('enforces authentication, trimmed text boundaries and article ID validation', async () => {
    await request(app).post(url('bad-id')).send({ text: 'test' }).expect(401);
    await request(app).get(url('bad-id')).expect(400);
    await request(app)
      .post(url('bad-id'))
      .set('Authorization', auth(0))
      .send({ text: 'test' })
      .expect(400);
    await request(app).get(url(randomUUID())).expect(404);
    await request(app)
      .post(url(randomUUID()))
      .set('Authorization', auth(0))
      .send({ text: 'test' })
      .expect(404);
    for (const body of [
      {},
      { text: '' },
      { text: '   ' },
      { text: 42 },
      { text: 'x'.repeat(151) },
    ]) {
      await request(app)
        .post(url(articleIds[0]))
        .set('Authorization', auth(0))
        .send(body)
        .expect(400);
    }
    const response = await request(app)
      .post(url(articleIds[0]))
      .set('Authorization', auth(0))
      .send({ text: 'x'.repeat(150) })
      .expect(201);
    expect(response.body.data.text).toHaveLength(150);
  });

  it('preserves likes and article route behavior while validating article IDs', async () => {
    const articleUrl = `/api/articles/${articleIds[0]}`;
    await request(app)
      .post(`${articleUrl}/likes`)
      .set('Authorization', auth(0))
      .expect(200);
    const detail = await request(app).get(articleUrl).expect(200);
    expect(detail.body).toMatchObject({
      id: articleIds[0],
      genres: ['Fiction'],
      likesCount: 1,
    });
    await request(app)
      .put(articleUrl)
      .set('Authorization', auth(1))
      .send({ text: 'not owner' })
      .expect(403);
    const update = await request(app)
      .put(articleUrl)
      .set('Authorization', auth(0))
      .send({ text: 'updated' })
      .expect(200);
    expect(update.body.data).toMatchObject({
      text: 'updated',
      genres: ['Fiction'],
    });
    expect(update.body.data).not.toHaveProperty('likesCount');
    await request(app)
      .delete(articleUrl)
      .set('Authorization', auth(1))
      .expect(403);
    await request(app).get('/api/articles/not-a-uuid').expect(400);
    const lookup = vi.spyOn(Article, 'findByPk');
    await request(app)
      .put('/api/articles/not-a-uuid')
      .set('Authorization', auth(0))
      .send({})
      .expect(400);
    expect(lookup).not.toHaveBeenCalled();
    await request(app)
      .put('/api/articles/not-a-uuid')
      .set('Authorization', auth(0))
      .send({ text: 'test' })
      .expect(400);
    expect(lookup).not.toHaveBeenCalled();
    lookup.mockRestore();
    await request(app).get(`/api/articles/${randomUUID()}`).expect(404);
    await request(app)
      .put(`/api/articles/${randomUUID()}`)
      .set('Authorization', auth(0))
      .send({ text: 'test' })
      .expect(404);
    await request(app).delete('/api/articles/not-a-uuid').expect(401);
    await request(app)
      .delete('/api/articles/not-a-uuid')
      .set('Authorization', auth(0))
      .expect(400);
    await request(app)
      .delete(`/api/articles/${randomUUID()}`)
      .set('Authorization', auth(0))
      .expect(404);
  });

  it('reports database failures in article lookup and comment reads or writes', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const lookup = vi
      .spyOn(Article, 'findByPk')
      .mockRejectedValueOnce(new Error('lookup failed'));
    await request(app)
      .get(url(articleIds[0]))
      .expect(500, { status: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    lookup.mockRestore();
    vi.spyOn(Comment, 'findAll').mockRejectedValueOnce(
      new Error('read failed')
    );
    await request(app)
      .get(url(articleIds[0]))
      .expect(500, { status: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    vi.spyOn(Comment, 'create').mockRejectedValueOnce(
      new Error('write failed')
    );
    await request(app)
      .post(url(articleIds[0]))
      .set('Authorization', auth(0))
      .send({ text: 'test' })
      .expect(500, { status: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    expect(console.error).toHaveBeenCalledTimes(3);
  });

  it('cascades comments on article and user deletion', async () => {
    const extraUserId = randomUUID();
    const extraArticleId = randomUUID();
    await User.create({
      id: extraUserId,
      username: 'comment-cascade',
      name: 'Cascade',
      passwordHash: 'test',
      avatarUrl: '',
    });
    await Article.create({
      id: extraArticleId,
      userId: userIds[0],
      title: 'Cascade',
      description: 'Cascade',
      text: 'text',
    });
    await Comment.bulkCreate([
      { articleId: articleIds[0], userId: extraUserId, text: 'user cascade' },
      {
        articleId: extraArticleId,
        userId: userIds[0],
        text: 'article cascade',
      },
    ]);
    await User.destroy({ where: { id: extraUserId } });
    expect(await Comment.count({ where: { userId: extraUserId } })).toBe(0);
    await request(app)
      .delete(`/api/articles/${extraArticleId}`)
      .set('Authorization', auth(0))
      .expect(204);
    expect(await Comment.count({ where: { articleId: extraArticleId } })).toBe(
      0
    );
  });

  it('can roll back and reapply the comments migration', async () => {
    const queryInterface = sequelize.getQueryInterface();
    await migration.down({ context: queryInterface });
    commentsCreated = false;
    expect(await queryInterface.showAllTables()).not.toContain('comments');
    await migration.up({ context: queryInterface });
    commentsCreated = true;
    expect(await queryInterface.showAllTables()).toContain('comments');
  });
});
