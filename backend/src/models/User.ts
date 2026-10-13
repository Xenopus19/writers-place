import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../util/db.js';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare name: string;
  declare about: CreationOptional<string>;
  declare passwordHash: string;
  declare avatarUrl: string;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    about: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    avatarUrl: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: 'user',
    tableName: 'users',
    underscored: true,
    timestamps: false,
    defaultScope: { attributes: { exclude: ['passwordHash'] } },
    scopes: {
      withPassword: {
        attributes: {
          include: ['passwordHash'],
        },
      },
    },
  }
);
