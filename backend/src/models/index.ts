import { Article } from './Article.js';
import { ArticleGenre } from './ArticleGenre.js';
import { Genre } from './Genre.js';
import { User } from './User.js';

User.hasMany(Article, { foreignKey: 'userId', as: 'articles', onDelete: 'CASCADE' });
Article.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Article.belongsToMany(Genre, {
  through: ArticleGenre,
  foreignKey: 'articleId',
  otherKey: 'genreId',
  as: 'genres',
});
Genre.belongsToMany(Article, {
  through: ArticleGenre,
  foreignKey: 'genreId',
  otherKey: 'articleId',
  as: 'articles',
});

export { Article, ArticleGenre, Genre, User };
