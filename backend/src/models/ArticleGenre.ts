import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../util/db.js';

export class ArticleGenre extends Model<
  InferAttributes<ArticleGenre>,
  InferCreationAttributes<ArticleGenre>
> {
  declare articleId: string;
  declare genreId: string;
}

ArticleGenre.init(
  {
    articleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'article_id',
      primaryKey: true,
      references: { model: 'articles', key: 'id' },
    },
    genreId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'genre_id',
      primaryKey: true,
      references: { model: 'genres', key: 'id' },
    },
  },
  {
    sequelize,
    modelName: 'articleGenre',
    tableName: 'article_genres',
    underscored: true,
    timestamps: false,
  }
);
