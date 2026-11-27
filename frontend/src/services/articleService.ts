import api from "../utils/api";
import type {
  ArticleLikes,
  CreateComment,
  UpdateComment,
} from "@writers-place/shared";
import type { Article, Comment } from "../types";

export const getArticle = async (id: string): Promise<Article> => {
  const { data } = await api.get<Article>(`/articles/${id}`);
  return data;
};

export const likeArticle = async (articleId: string): Promise<ArticleLikes> => {
  const { data } = await api.post<ArticleLikes>(`/articles/${articleId}/likes`);
  return data;
};

export const unlikeArticle = async (
  articleId: string,
): Promise<ArticleLikes> => {
  const { data } = await api.delete<ArticleLikes>(
    `/articles/${articleId}/likes`,
  );
  return data;
};

export const getArticleComments = async (
  articleId: string,
): Promise<Comment[]> => {
  const { data } = await api.get<Comment[]>(`/articles/${articleId}/comments`);
  return data;
};

export const createArticleComment = async (
  articleId: string,
  comment: CreateComment,
): Promise<Comment> => {
  const { data } = await api.post<{ data: Comment }>(
    `/articles/${articleId}/comments`,
    comment,
  );
  return data.data;
};

export const updateArticleComment = async (
  articleId: string,
  commentId: string,
  comment: UpdateComment,
): Promise<Comment> => {
  const { data } = await api.put<{ data: Comment }>(
    `/articles/${articleId}/comments/${commentId}`,
    comment,
  );
  return data.data;
};

export const deleteArticleComment = async (
  articleId: string,
  commentId: string,
): Promise<void> => {
  await api.delete(`/articles/${articleId}/comments/${commentId}`);
};
