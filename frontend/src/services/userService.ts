import api from "../utils/api";
import type { SignUpRequestType } from "../components/SignUp/SignUpSchema";

export const createUser = async (data: SignUpRequestType) => {
  const response = await api.post("/users", data);
  return response.data;
};