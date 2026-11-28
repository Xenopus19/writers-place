import api from "../utils/api";
import type { CreateComment, UpdateComment } from "@writers-place/shared";
import type { Article, Comment } from "../types";

export const getArticles = async (): Promise<Article[]> => {
  const { data } = await api.get<Article[]>("/articles");
  return data;
};

export type CreateArticleData = {
  title: string;
  description: string;
  text: string;
  genres: string[];
};

export const createArticle = async (
  article: CreateArticleData,
): Promise<unknown> => {
  const { data } = await api.post<{ data: unknown }>("/articles", article);
  return data.data;
};

export const getArticle = async (id: string): Promise<Article> => {
  const { data } = await api.get<Article>(`/articles/${id}`);
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
