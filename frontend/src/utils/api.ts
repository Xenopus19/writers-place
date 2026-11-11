import axios, { AxiosError } from "axios";
import { TOKEN } from "./localStorage";
import type { ApiErrorResponse } from "@writers-place/shared";
import { ApiError } from "./ApiError";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL ?? ""}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const errorData = error.response.data;

      throw new ApiError({
        status: error.response.status,
        code: errorData?.code || 'UNKNOWN_ERROR',
        message: errorData?.message || 'Произошла непредвиденная ошибка',
        errors: errorData?.errors,
      });
    } else if (error.request) {
      throw new ApiError({
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Network error.',
      });
    }

    throw new ApiError({
      status: 500,
      code: 'REQUEST_SETUP_ERROR',
      message: error.message,
    });
  }
);

export default api;
