import type { Article } from '../../types'
import ArticleCard from './ArticleCard'

const ArticlesList = ({ articles }: { articles: Article[] }) => {
  return (
    <div>
      {articles.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </div>
  )
}

export default ArticlesList