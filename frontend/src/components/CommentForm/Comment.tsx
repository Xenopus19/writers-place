import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCommentSchema, type UpdateComment } from '@writers-place/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { updateArticleComment, deleteArticleComment } from '../../services/articleService';
import useError from '../../hooks/useError';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface CommentProps {
  articleId: string;
  isAuthor: boolean;
  comment: {
    id: string;
    author?: string;
    username?: string;
    createdAt?: string;
    text: string;
  };
}

const Comment = ({ articleId, isAuthor, comment }: CommentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { reportError } = useError();
  const form = useForm<UpdateComment>({
    resolver: zodResolver(updateCommentSchema),
    defaultValues: { text: comment.text },
  });
  const updateMutation = useMutation({
    mutationFn: (updated: UpdateComment) =>
      updateArticleComment(articleId, comment.id, updated),
    onSuccess: () => {
      setIsEditing(false);
      void queryClient.invalidateQueries({
        queryKey: ['articles', articleId, 'comments'],
      });
    },
    onError: (error) => {
      reportError('Failed to update comment. Please try again.', error);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteArticleComment(articleId, comment.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['articles', articleId, 'comments'],
      });
    },
    onError: (error) => {
      reportError('Failed to delete comment. Please try again.', error);
    },
  });

  const startEditing = () => {
    form.reset({ text: comment.text });
    setIsEditing(true);
  };

  const deleteComment = () => {
    if (window.confirm('Delete this comment? This cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-author">{comment.author || comment.username || 'User'}</span>
        <span className="comment-date">{comment.createdAt || '2026-01-02'}</span>
      </div>
      {isEditing ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit((updated) => updateMutation.mutate(updated))}
        >
          <label htmlFor={`edit-comment-${comment.id}`} className="sr-only">
            Edit comment
          </label>
          <Textarea
            id={`edit-comment-${comment.id}`}
            aria-invalid={!!form.formState.errors.text}
            aria-describedby={form.formState.errors.text ? `edit-comment-error-${comment.id}` : undefined}
            disabled={updateMutation.isPending}
            {...form.register('text')}
          />
          {form.formState.errors.text && (
            <p id={`edit-comment-error-${comment.id}`} role="alert" className="text-sm text-red-600">
              {form.formState.errors.text.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={updateMutation.isPending}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <p className="comment-text">{comment.text}</p>
          {isAuthor && (
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={startEditing}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={deleteComment}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Comment;