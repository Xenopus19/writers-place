import api from "../utils/api";

export type CreateArticleData = {
  title: string;
  description: string;
  text: string;
};

export type Article = {
  id: number;
  title: string;
  description: string;
  text: string;
  userId: number;
  createdAt: string;
};

export const createArticle = async (
  data: CreateArticleData,
): Promise<unknown> => {
  const response = await api.post<{ data: unknown }>("/articles", data);
  return response.data.data;
};

export const getArticles = async (): Promise<Article[]> => {
  const response = await api.get<Article[]>("/articles");
  return response.data;
};

export const getArticle = async (id: string | number): Promise<Article> => {
  const response = await api.get<Article>(`/articles/${encodeURIComponent(id)}`);
  return response.data;
};
