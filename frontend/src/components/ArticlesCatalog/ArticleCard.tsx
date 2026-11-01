import { Link } from 'react-router-dom';

interface ArticleCardProps {
  id: string | number;
  title: string;
  description: string;
  genres?: string[];
  likesCount?: number;
  createdAt?: string;
  coverUrl?: string;
}

export const ArticleCard = ({
  id,
  title,
  description,
  genres,
  likesCount = 0,
  createdAt,
  coverUrl,
}: ArticleCardProps) => {
  return (
    <article className="catalog-card">
      <div className="catalog-card-image-wrapper">
        <img
          src={coverUrl || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800'}
          alt={title}
          className="catalog-card-image"
        />
      </div>

      <div className="catalog-card-content">
        <div className="catalog-card-tags">
          {genres?.map((genre, idx) => (
            <span key={idx} className="tag-pill">
              {genre}
            </span>
          )) || <span className="tag-pill">Article</span>}
        </div>

        <h2 className="catalog-card-title">
          <Link to={`/articles/${id}`}>{title}</Link>
        </h2>

        <p className="catalog-card-desc">{description}</p>

        <div className="catalog-card-footer">
          <div className="card-meta">
            <span className="meta-likes">♥ {likesCount} likes</span>
            <span className="meta-divider">•</span>
            <span className="meta-date">{createdAt || '2026-01-01'}</span>
          </div>

          <Link to={`/articles/${id}`} className="read-more-link">
            Read ↗
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard