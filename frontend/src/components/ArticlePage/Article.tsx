interface ArticleProps {
  article: {
    title: string;
    content?: string;
    description?: string;
    genres?: string[];
    likesCount?: number;
    createdAt?: string;
    author?: string;
    coverUrl?: string;
  };
}

const Article = ({ article }: ArticleProps) => {
  return (
    <article className="article-content-wrapper">
      <div className="article-top-meta">
        <span className="article-category-tag">
          {article.genres?.join(', ') || 'Story'}
        </span>
        <span className="meta-dot">•</span>
        <span>{article.createdAt || '2026-01-01'}</span>
      </div>

      <h1 className="article-main-title">{article.title}</h1>

      <div className="article-author-info">
        <span>Written by <strong>{article.author || 'Author'}</strong></span>
      </div>

      {article.coverUrl && (
        <div className="article-hero-image-wrapper">
          <img
            src={article.coverUrl}
            alt={article.title}
            className="article-hero-image"
          />
        </div>
      )}

      <div className="article-body-content">
        <p>{article.description}</p>
        {article.content && <p>{article.content}</p>}
      </div>

      <div className="article-actions-bar">
        <button className="like-button-aesthetic">
          <span>♥</span> Like story ({article.likesCount ?? 0})
        </button>
      </div>
    </article>
  );
};

export default Article;