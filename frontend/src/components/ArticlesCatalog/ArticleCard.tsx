import { Link } from 'react-router-dom'
import type { Article } from '../../types'

const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <Link to={`/articles/${article.id}`}>
      <div className="m-2 border border-gray-300 p-2">
        <h3>{article.title}</h3>
        <p>{article.description}</p>
        <small>{article.genres.join(', ')} | {article.likes} likes | {article.createdAt}</small>
      </div>
    </Link>
  )
}

export default ArticleCard