import { ArticleCard } from './ArticleCard';

interface Article {
  id: string | number;
  title: string;
  description: string;
  genres?: string[];
  likesCount?: number;
  createdAt?: string;
  coverUrl?: string;
}

interface ArticlesListProps {
  articles: Article[];
}

export const ArticlesList = ({ articles }: ArticlesListProps) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="empty-articles">
        <p>No articles found.</p>
      </div>
    );
  }

  return (
    <div className="catalog-grid">
      {articles.map((article) => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  );
};

export default ArticlesList