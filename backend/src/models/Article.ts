import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../util/db.js';

export class Article extends Model<
  InferAttributes<Article>,
  InferCreationAttributes<Article>
> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare description: string;
  declare text: string;
  declare userId: string;
  declare embedding: CreationOptional<number[] | null>;
  declare createdAt: CreationOptional<Date>;
}

Article.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: { model: 'users', key: 'id' },
    },
    embedding: { type: DataTypes.ARRAY(DataTypes.FLOAT), allowNull: true },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  },
  {
    sequelize,
    modelName: 'article',
    tableName: 'articles',
    underscored: true,
    updatedAt: false,
    defaultScope: { attributes: { exclude: ['embedding'] } },
    scopes: { withEmbedding: { attributes: { include: ['embedding'] } } },
  }
);
