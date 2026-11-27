import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../util/db.js';

export class ArticleLike extends Model<
  InferAttributes<ArticleLike>,
  InferCreationAttributes<ArticleLike>
> {
  declare articleId: string;
  declare userId: string;
}

ArticleLike.init(
  {
    articleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'article_id',
      primaryKey: true,
      references: { model: 'articles', key: 'id' },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      primaryKey: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    sequelize,
    modelName: 'articleLike',
    tableName: 'article_likes',
    underscored: true,
    timestamps: false,
  }
);
