import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeArticle, unlikeArticle } from '../services/articleService';
import type { Article } from '../types';
import useError from './useError';

const useArticleLike = (articleId: string) => {
  const queryClient = useQueryClient();
  const { reportError } = useError();
  const queryKey = ['articles', articleId];

  return useMutation({
    mutationFn: (liked: boolean) =>
      liked ? likeArticle(articleId) : unlikeArticle(articleId),
    onMutate: async (liked) => {
      await queryClient.cancelQueries({ queryKey, exact: true });
      const previous = queryClient.getQueryData<Article>(queryKey);
      if (previous) {
        queryClient.setQueryData<Article>(queryKey, {
          ...previous,
          likedByMe: liked,
          likesCount: Math.max(0, previous.likesCount + (liked ? 1 : -1)),
        });
      }
      return { previous };
    },
    onError: (error, liked, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Article>(queryKey, context.previous);
      }
      reportError(
        liked
          ? 'Failed to like the story. Please try again.'
          : 'Failed to remove your like. Please try again.',
        error,
      );
    },
    onSuccess: ({ likesCount }, liked) => {
      queryClient.setQueryData<Article>(queryKey, (current) =>
        current && { ...current, likesCount, likedByMe: liked },
      );
    },
  });
};

export default useArticleLike;
