import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getArticle } from '../../services/articleService';
import { placeholderComments } from '../../placeholders';
import CommentForm from '../CommentForm';
import Comment from '../CommentForm/Comment';
import Article from './Article';

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: article,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['articles', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Article ID is required.');
      }
      return getArticle(id);
    },
    enabled: Boolean(id),
  });

  if (!id) {
    return <p role="alert">Article not found.</p>;
  }

  if (isLoading) {
    return <p role="status">Loading article…</p>;
  }

  if (isError || !article) {
    return (
      <p role="alert">
        {error instanceof Error ? error.message : 'Unable to load article.'}
      </p>
    );
  }

  return (
    <div className="article-page-container">
      {/* Сама статья */}
      <Article
        article={{
          title: article.title,
          description: article.description,
          content: article.text,
          createdAt: article.createdAt,
        }}
      />

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