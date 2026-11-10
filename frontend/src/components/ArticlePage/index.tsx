import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getArticle, getArticleComments } from '../../services/articleService';
import CommentForm from '../CommentForm';
import Comment from '../CommentForm/Comment';
import { Spinner } from '../ui/spinner';
import Article from './Article';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-CA');

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();

  const articleQuery = useQuery({
    queryKey: ['articles', id],
    queryFn: () => getArticle(id!),
    enabled: !!id,
  });

  const commentsQuery = useQuery({
    queryKey: ['articles', id, 'comments'],
    queryFn: () => getArticleComments(id!),
    enabled: !!id,
  });

  const article = articleQuery.data;
  const comments = commentsQuery.data ?? [];

  return (
    <div className="article-page-container">
      {articleQuery.isPending && (
        <div className="flex justify-center py-10">
          <Spinner className="size-8 text-[#899273]" />
        </div>
      )}
      {articleQuery.isError && (
        <p className="py-10 text-center text-sm text-red-600">
          Failed to load the article.
        </p>
      )}
      {article && (
        <Article
          article={{
            title: article.title,
            description: article.description,
            content: article.text,
            genres: article.genres,
            likesCount: article.likesCount,
            createdAt: formatDate(article.createdAt),
          }}
        />
      )}

      <section className="comments-section-wrapper">
        <h3>Discussion</h3>

        <div className="comments-list">
          {commentsQuery.isPending && (
            <div className="flex justify-center py-6">
              <Spinner className="size-6 text-[#899273]" />
            </div>
          )}
          {commentsQuery.isError && (
            <p className="py-6 text-center text-sm text-red-600">
              Failed to load comments.
            </p>
          )}
          {commentsQuery.isSuccess && comments.length === 0 && (
            <p className="py-6 text-center text-sm text-[#73746a]">
              No comments yet. Be the first to share your thoughts.
            </p>
          )}
          {comments.map((c) => (
            <Comment
              key={c.id}
              comment={{
                id: c.id,
                author: c.user?.name,
                username: c.user?.username,
                createdAt: formatDate(c.createdAt),
                text: c.text,
              }}
            />
          ))}
        </div>

        <div className="comment-form-container">
          {id && <CommentForm key={id} articleId={id} />}
        </div>
      </section>
    </div>
  );
};

export default ArticlePage;