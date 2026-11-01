import { placeholderArticle, placeholderComments } from '../../placeholders';
import CommentForm from '../CommentForm';
import Comment from '../CommentForm/Comment';
import Article from './Article';

const ArticlePage = () => {
  return (
    <div className="article-page-container">
      {/* Сама статья */}
      <Article article={placeholderArticle} />

      {/* Секция комментариев */}
      <section className="comments-section-wrapper">
        <h3>Discussion</h3>
        
        <div className="comments-list">
          {placeholderComments.map((c) => (
            <Comment key={c.id} comment={c} />
          ))}
        </div>

        <div className="comment-form-container">
          <CommentForm />
        </div>
      </section>
    </div>
  );
};

export default ArticlePage;