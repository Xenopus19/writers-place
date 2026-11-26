import { Link } from 'react-router-dom'

interface ArticleCardProps {
  title: string
  excerpt: string
  image: string
  tag: string
  href: string
}

const ArticleCard = ({ title, excerpt, image, tag, href }: ArticleCardProps) => (
  <Link to={href} className="article-card-link">
    <article className="catalog-card">
      <div className="catalog-card-image-wrapper">
        <img src={image} alt={title} className="catalog-card-image" />
      </div>

      <div className="catalog-card-content">
        <span className="catalog-card-tags">{tag}</span>
        <h2 className="catalog-card-title">{title}</h2>
        <p className="catalog-card-desc">{excerpt}</p>
        <span className="article-card-cta">Read story ↗</span>
      </div>
    </article>
  </Link>
)

export default ArticleCard
