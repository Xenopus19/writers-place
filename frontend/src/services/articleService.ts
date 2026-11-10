import api from "../utils/api";
import type { CreateComment } from "@writers-place/shared";
import type { Article, Comment } from "../types";

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
