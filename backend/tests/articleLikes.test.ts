import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { DataTypes } from 'sequelize';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const embeddings = vi.hoisted(() => ({
  embedArticle: vi.fn(async () => 'test embedding'),
  embedQuery: vi.fn(async () => [0]),
  findNearestArticles: vi.fn(),
}));

vi.mock('../src/util/embeddings.js', () => embeddings);

const databaseUrl = process.env.LIKES_TEST_DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;

describeDatabase('article likes', () => {
  let app: typeof import('../src/app.js').app;
  let Article: typeof import('../src/models/index.js').Article;
  let ArticleLike: typeof import('../src/models/index.js').ArticleLike;
  let Genre: typeof import('../src/models/index.js').Genre;
  let User: typeof import('../src/models/index.js').User;
  let sequelize: typeof import('../src/util/db.js').sequelize;
  let dropLikes: typeof import('../src/migrations/zz_article_likes.js').down;
  let jwtSecret: string;
  let ownsTables = false;
  let likesCreated = false;
  const userIds = [randomUUID(), randomUUID(), randomUUID()];
  const articleIds = [randomUUID(), randomUUID(), randomUUID()];
  const token = (index: number) =>
    jwt.sign(
      { id: userIds[index], username: `likes-test-${index}` },
      jwtSecret
    );
  const likesUrl = (id: string) => `/api/articles/${id}/likes`;
  const auth = (index: number) => `Bearer ${token(index)}`;

  beforeAll(async () => {
    if (
      !databaseUrl ||
      databaseUrl !== process.env.DATABASE_URL ||
      new URL(databaseUrl).pathname !== '/writers_place_likes_test'
    ) {
      throw new Error(
        'Tests require an isolated writers_place_likes_test database'
      );
    }

    ({ app } = await import('../src/app.js'));
    ({ Article, ArticleLike, Genre, User } =
      await import('../src/models/index.js'));
    ({ sequelize } = await import('../src/util/db.js'));
    ({ JWT_SECRET: jwtSecret } = await import('../src/util/config.js'));
    const { up: createUsers } =
      await import('../src/migrations/13102026_users.js');
    const { up: createGenres } =
      await import('../src/migrations/03112026_genres.js');
    const likesMigration =
      await import('../src/migrations/zz_article_likes.js');
    dropLikes = likesMigration.down;

    const queryInterface = sequelize.getQueryInterface();
    const existingTables = await queryInterface.showAllTables();
    if (existingTables.length > 0) {
      throw new Error('Likes test database must not contain existing tables');
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
    await likesMigration.up({ context: queryInterface });
    likesCreated = true;

    for (let index = 0; index < userIds.length; index += 1) {
      await User.create({
        id: userIds[index],
        username: `likes-test-${index}`,
        name: `User ${index}`,
        passwordHash: 'test-hash',
        avatarUrl: '',
      });
      await Article.create({
        id: articleIds[index],
        userId: userIds[index],
        title: `Article ${index}`,
        description: `Description ${index}`,
        text: 'Article text',
      });
    }
    const fiction = await Genre.findOne({ where: { name: 'Fiction' } });
    if (!fiction) throw new Error('Missing Fiction test genre');
    const firstArticle = await Article.findByPk(articleIds[0]);
    if (!firstArticle) throw new Error('Missing test article');
    await firstArticle.setGenres([fiction]);
  });

  beforeEach(async () => {
    await ArticleLike.destroy({ where: {} });
    vi.clearAllMocks();
  });

  afterAll(async () => {
    if (likesCreated) {
      await dropLikes({ context: sequelize.getQueryInterface() });
    }
    if (ownsTables) {
      await sequelize.query(
        'DROP TABLE IF EXISTS article_likes, article_genres, genres, articles, users'
      );
    }
    if (sequelize) await sequelize.close();
  });

  it('requires authentication and validates article IDs', async () => {
    await request(app).post(likesUrl(articleIds[0])).expect(401);
    await request(app)
      .delete(likesUrl(articleIds[0]))
      .set('Authorization', 'Bearer invalid')
      .expect(401);
    await request(app)
      .post(likesUrl('not-a-uuid'))
      .set('Authorization', auth(0))
      .expect(400);
    await request(app)
      .delete(likesUrl('not-a-uuid'))
      .set('Authorization', auth(0))
      .expect(400);
    await request(app)
      .post(likesUrl(randomUUID()))
      .set('Authorization', auth(0))
      .expect(404);
    await request(app)
      .delete(likesUrl(randomUUID()))
      .set('Authorization', auth(0))
      .expect(404);
  });

  it('likes and unlikes idempotently per user and per article, including own articles', async () => {
    expect(
      (
        await request(app)
          .post(likesUrl(articleIds[0]))
          .set('Authorization', auth(0))
          .expect(200)
      ).body
    ).toEqual({ likesCount: 1 });
    expect(
      (
        await request(app)
          .post(likesUrl(articleIds[0]))
          .set('Authorization', auth(0))
          .expect(200)
      ).body
    ).toEqual({ likesCount: 1 });
    expect(
      (
        await request(app)
          .post(likesUrl(articleIds[0]))
          .set('Authorization', auth(1))
          .expect(200)
      ).body
    ).toEqual({ likesCount: 2 });
    expect(
      (
        await request(app)
          .post(likesUrl(articleIds[1]))
          .set('Authorization', auth(0))
          .expect(200)
      ).body
    ).toEqual({ likesCount: 1 });
    expect(
      (
        await request(app)
          .delete(likesUrl(articleIds[0]))
          .set('Authorization', auth(0))
          .expect(200)
      ).body
    ).toEqual({ likesCount: 1 });
    expect(
      (
        await request(app)
          .delete(likesUrl(articleIds[0]))
          .set('Authorization', auth(0))
          .expect(200)
      ).body
    ).toEqual({ likesCount: 1 });
    expect(
      await ArticleLike.count({ where: { articleId: articleIds[1] } })
    ).toBe(1);
  });

  it('prevents duplicate likes under concurrent requests', async () => {
    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        request(app).post(likesUrl(articleIds[0])).set('Authorization', auth(0))
      )
    );
    expect(responses.map((response) => response.status)).toEqual(
      Array(10).fill(200)
    );
    expect(
      await ArticleLike.count({ where: { articleId: articleIds[0] } })
    ).toBe(1);
  });

  it('returns numeric counts on list, filtered list, detail and search while preserving order', async () => {
    await ArticleLike.bulkCreate([
      { articleId: articleIds[0], userId: userIds[0] },
      { articleId: articleIds[0], userId: userIds[1] },
      { articleId: articleIds[1], userId: userIds[0] },
    ]);

    const list = await request(app).get('/api/articles').expect(200);
    const counts = new Map<string, number>(
      list.body.map((article: { id: string; likesCount: number }) => [
        article.id,
        article.likesCount,
      ])
    );
    expect(counts.get(articleIds[0])).toBe(2);
    expect(counts.get(articleIds[1])).toBe(1);
    expect(counts.get(articleIds[2])).toBe(0);

    const filtered = await request(app)
      .get('/api/articles')
      .query({ genre: 'Fiction' })
      .expect(200);
    expect(filtered.body).toHaveLength(1);
    expect(filtered.body[0]).toMatchObject({
      id: articleIds[0],
      genres: ['Fiction'],
      likesCount: 2,
    });
    const detail = await request(app)
      .get(`/api/articles/${articleIds[0]}`)
      .expect(200);
    expect(detail.body).toMatchObject({ id: articleIds[0], likesCount: 2 });

    embeddings.findNearestArticles.mockResolvedValue([
      { id: articleIds[2] },
      { id: articleIds[0] },
    ]);
    const search = await request(app)
      .get('/api/articles/search')
      .query({ q: 'test' })
      .expect(200);
    expect(
      search.body.map((article: { id: string; likesCount: number }) => [
        article.id,
        article.likesCount,
      ])
    ).toEqual([
      [articleIds[2], 0],
      [articleIds[0], 2],
    ]);
    embeddings.findNearestArticles.mockResolvedValue([]);
    expect(
      (
        await request(app)
          .get('/api/articles/search')
          .query({ q: 'test' })
          .expect(200)
      ).body
    ).toEqual([]);
  });

  it('preserves create and update response shapes', async () => {
    const created = await request(app)
      .post('/api/articles')
      .set('Authorization', auth(0))
      .send({
        title: 'Created article',
        description: 'Created description',
        text: 'Created text',
        genres: ['Fiction'],
      })
      .expect(201);
    expect(created.body.data).not.toHaveProperty('likesCount');
    const updated = await request(app)
      .put(`/api/articles/${created.body.data.id}`)
      .set('Authorization', auth(0))
      .send({ text: 'Updated text' })
      .expect(200);
    expect(updated.body.data).not.toHaveProperty('likesCount');
    expect(
      (
        await request(app)
          .get(`/api/articles/${created.body.data.id}`)
          .expect(200)
      ).body.likesCount
    ).toBe(0);
  });

  it('cascades likes when a user or an article is deleted', async () => {
    await ArticleLike.bulkCreate([
      { articleId: articleIds[1], userId: userIds[2] },
      { articleId: articleIds[2], userId: userIds[0] },
    ]);
    await User.destroy({ where: { id: userIds[2] } });
    expect(await ArticleLike.count({ where: { userId: userIds[2] } })).toBe(0);
    expect(
      await ArticleLike.count({ where: { articleId: articleIds[2] } })
    ).toBe(0);
    await ArticleLike.create({ articleId: articleIds[1], userId: userIds[0] });
    await Article.destroy({ where: { id: articleIds[1] } });
    expect(
      await ArticleLike.count({ where: { articleId: articleIds[1] } })
    ).toBe(0);
  });
});
