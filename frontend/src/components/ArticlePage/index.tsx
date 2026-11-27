import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getArticle, getArticleComments } from '../../services/articleService';
import { useUser } from '../UserContext';
import CommentForm from '../CommentForm';
import Comment from '../CommentForm/Comment';
import { Spinner } from '../ui/spinner';
import Article from './Article';
import useQueryError from '../../hooks/useQueryError';
import { Button } from '../ui/button';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-CA');

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const user = useUser();

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

  useQueryError(articleQuery.error, articleQuery.errorUpdatedAt, articleQuery.isError, 'Failed to load the article.');
  useQueryError(commentsQuery.error, commentsQuery.errorUpdatedAt, commentsQuery.isError, 'Failed to load comments.');

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
        <div className="py-10 text-center">
          <Button type="button" variant="outline" onClick={() => void articleQuery.refetch()}>
            Retry loading article
          </Button>
        </div>
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
            <div className="py-6 text-center">
              <Button type="button" variant="outline" onClick={() => void commentsQuery.refetch()}>
                Retry loading comments
              </Button>
            </div>
          )}
          {commentsQuery.isSuccess && comments.length === 0 && (
            <p className="py-6 text-center text-sm text-[#73746a]">
              No comments yet. Be the first to share your thoughts.
            </p>
          )}
          {comments.map((c) => (
            <Comment
              key={c.id}
              articleId={id!}
              isAuthor={c.userId === user?.id}
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