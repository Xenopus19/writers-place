import { QueryTypes } from 'sequelize';
import { sequelize } from './db.js';

export const getLikesCounts = async (articleIds: string[]) => {
  if (articleIds.length === 0) {
    return new Map<string, number>();
  }

  const rows = await sequelize.query<{ articleId: string; count: string }>(
    `SELECT article_id AS "articleId", COUNT(*) AS count
     FROM article_likes
     WHERE article_id IN (:articleIds)
     GROUP BY article_id`,
    {
      replacements: { articleIds },
      type: QueryTypes.SELECT,
    }
  );
  return new Map(rows.map((row) => [row.articleId, Number(row.count)]));
};
