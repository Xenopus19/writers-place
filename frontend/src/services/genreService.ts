import api from "../utils/api";

export type Genre = {
  id: string | number;
  name: string;
};

export const getGenres = async (): Promise<Genre[]> => {
  const response = await api.get<Genre[]>("/genres");
  return response.data;
};
