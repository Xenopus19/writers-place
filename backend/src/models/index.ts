import { Article } from './Article.js';
import { User } from './User.js';

User.hasMany(Article, { foreignKey: 'userId', as: 'articles', onDelete: 'CASCADE' });
Article.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { Article, User };
