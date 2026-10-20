import api from "../utils/api";
import type { SignUpRequestType } from "../components/SignUp/SignUpSchema";
import type { User } from "../types";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export const createUser = async (data: SignUpRequestType) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await api.get<User>("/users/me");
  return data;
};

export const loginUser = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/login", {
    username,
    password,
  });
  return data;
};