import { Article } from './Article.js';
import { ArticleGenre } from './ArticleGenre.js';
import { ArticleLike } from './ArticleLike.js';
import { Comment } from './Comment.js';
import { Genre } from './Genre.js';
import { User } from './User.js';

User.hasMany(Article, {
  foreignKey: 'userId',
  as: 'articles',
  onDelete: 'CASCADE',
});
Article.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Article.hasMany(Comment, {
  foreignKey: 'articleId',
  as: 'comments',
  onDelete: 'CASCADE',
});
Comment.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });
User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments',
  onDelete: 'CASCADE',
});
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

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

Article.belongsToMany(User, {
  through: ArticleLike,
  foreignKey: 'articleId',
  otherKey: 'userId',
  as: 'likedBy',
});
User.belongsToMany(Article, {
  through: ArticleLike,
  foreignKey: 'userId',
  otherKey: 'articleId',
  as: 'likedArticles',
});

export { Article, ArticleGenre, ArticleLike, Comment, Genre, User };
