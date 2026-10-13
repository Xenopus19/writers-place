import { placeholderArticles } from '../../placeholders'
import ArticlesList from './ArticlesList'

const ArticlesCatalog = () => {
  return (
    <div>
      <h1>Articles Catalog</h1>
      <ArticlesList articles={placeholderArticles} />
    </div>
  )
}

export default ArticlesCatalog