import ArticleCard from '../ArticleCard'
import useArticles from '../../hooks/useArticles'

const defaultArticleImage =
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800'

export const ArticlesList = () => {
  const { data: articles = [], error, isError, isLoading } = useArticles()

  if (isLoading) {
    return <p role="status">Loading articles…</p>
  }

  if (isError) {
    return (
      <p role="alert">
        {error instanceof Error ? error.message : 'Unable to load articles.'}
      </p>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="empty-articles">
        <p>No articles found.</p>
      </div>
    );
  }

  return (
    <div className="catalog-grid">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          title={article.title}
          excerpt={article.description}
          image={defaultArticleImage}
          tag=""
          href={`/articles/${article.id}`}
        />
      ))}
    </div>
  );
};

export default ArticlesList