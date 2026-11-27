import LikeButton from './LikeButton';

interface ArticleProps {
  article: {
    id: string;
    title: string;
    content?: string;
    description?: string;
    genres?: string[];
    likesCount?: number;
    likedByMe?: boolean;
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
        <span className="meta-dot" aria-hidden="true">•</span>
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
        <LikeButton
          articleId={article.id}
          likesCount={article.likesCount ?? 0}
          liked={article.likedByMe ?? false}
        />
      </div>
    </article>
  );
};

export default Article;