import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCommentSchema, type CreateComment } from '@writers-place/shared';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { createArticleComment } from '../../services/articleService';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

const CommentForm = ({ articleId }: { articleId: string }) => {
  const queryClient = useQueryClient();
  const form = useForm<CreateComment>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { text: '' },
  });
  const mutation = useMutation({
    mutationFn: (comment: CreateComment) =>
      createArticleComment(articleId, comment),
    onSuccess: () => {
      form.reset();
      void queryClient.invalidateQueries({
        queryKey: ['articles', articleId, 'comments'],
      });
    },
  });
  const unauthorized =
    axios.isAxiosError(mutation.error) && mutation.error.response?.status === 401;

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={form.handleSubmit((comment) => mutation.mutate(comment))}
    >
      <label htmlFor="comment-text" className="sr-only">
        Comment
      </label>
      <Textarea
        id="comment-text"
        placeholder="Write a comment"
        disabled={mutation.isPending}
        aria-invalid={!!form.formState.errors.text}
        aria-describedby={form.formState.errors.text ? 'comment-error' : undefined}
        {...form.register('text')}
      />
      {form.formState.errors.text && (
        <p id="comment-error" role="alert" className="text-sm text-red-600">
          {form.formState.errors.text.message}
        </p>
      )}
      {mutation.isError && (
        <p role="alert" className="text-sm text-red-600">
          {unauthorized ? (
            <>Please <Link to="/login" className="underline">log in</Link> to comment.</>
          ) : (
            'Failed to post comment. Please try again.'
          )}
        </p>
      )}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Sending...' : 'Send'}
      </Button>
    </form>
  );
};

export default CommentForm;
