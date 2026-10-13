import type { Article as ArticleType } from '../../types'

const Article = ({ article }: { article: ArticleType }) => {
  return (
    <article>
      <h1>{article.title}</h1>
      <small>{article.genres.join(', ')} | {article.likes} likes | {article.createdAt}</small>
      <p>{article.text}</p>
    </article>
  )
}

export default Article