import pgvector from 'pgvector';
import ai from './ai.js';
import { sequelize } from './db.js';
import { Article } from '../models/index.js';

const embedText = async (contents: string): Promise<number[]> => {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents,
    config: {
      outputDimensionality: 768
    },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values) {
    throw new Error('Embedding response was empty');
  }
  return values;
};

export const embedArticle = async (article: {
  title: string;
  description: string;
}): Promise<string> =>
  String(pgvector.toSql(await embedText(`${article.title}\n${article.description}`)));

export const embedQuery = (query: string): Promise<number[]> => embedText(query);

export const findNearestArticles = async (targetVector: number[], limit = 5) => {
  const vectorSql = pgvector.toSql(targetVector);

  const articles = await sequelize.query(
    `
    SELECT id, title, description, text, user_id, created_at
    FROM articles
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> :vector
    LIMIT :limit
    `,
    {
      model: Article,
      mapToModel: true,
      replacements: { vector: vectorSql, limit },
    }
  );

  return articles;
};