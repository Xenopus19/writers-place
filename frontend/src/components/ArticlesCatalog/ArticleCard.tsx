import { Link } from 'react-router-dom'
import type { Article } from '../../types'

const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <Link to={`/articles/${article.id}`}>
      <div style={{ border: '1px solid #ccc', padding: 8, margin: 8 }}>
        <h3>{article.title}</h3>
        <p>{article.description}</p>
        <small>{article.genres.join(', ')} | {article.likes} likes | {article.createdAt}</small>
      </div>
    </Link>
  )
}

export default ArticleCard