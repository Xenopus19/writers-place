import { placeholderArticle, placeholderComments } from '../../placeholders'
import Comment from '../CommentForm/Comment'
import CommentForm from '../CommentForm'
import Article from './Article'

const ArticlePage = () => {
  return (
    <div>
      <Article article={placeholderArticle} />
      <h2>Comments</h2>
      {placeholderComments.map((c) => (
        <Comment key={c.id} comment={c} />
      ))}
      <CommentForm />
    </div>
  )
}

export default ArticlePage