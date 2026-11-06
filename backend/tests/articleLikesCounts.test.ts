import { beforeEach, describe, expect, it, vi } from 'vitest';

const query = vi.hoisted(() => vi.fn());
vi.mock('../src/util/db.js', () => ({ sequelize: { query } }));

import { getLikesCounts } from '../src/util/articleLikes.js';

describe('getLikesCounts', () => {
  beforeEach(() => {
    query.mockReset();
  });

  it('does not query for an empty list', async () => {
    expect(await getLikesCounts([])).toEqual(new Map());
    expect(query).not.toHaveBeenCalled();
  });

  it('groups requested article IDs in one query and converts counts to numbers', async () => {
    query.mockResolvedValue([
      { articleId: 'article-1', count: '2' },
      { articleId: 'article-2', count: '1' },
    ]);

    expect(
      await getLikesCounts(['article-1', 'article-2', 'article-3'])
    ).toEqual(
      new Map([
        ['article-1', 2],
        ['article-2', 1],
      ])
    );
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0][1].replacements.articleIds).toEqual([
      'article-1',
      'article-2',
      'article-3',
    ]);
  });

  it('propagates database failures', async () => {
    query.mockRejectedValue(new Error('database unavailable'));
    await expect(getLikesCounts(['article-1'])).rejects.toThrow(
      'database unavailable'
    );
  });
});
