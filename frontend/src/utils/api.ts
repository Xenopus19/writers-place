import axios from "axios";
import { TOKEN } from "./localStorage";

export class ApiError extends Error {
  public code: number;
  public details: string | null;
  constructor(code: number, message: string, details: string | null) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export async function request(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || 'Произошла ошибка',
        data.detail || null
      );
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, 'Network error.', 'NETWORK_ERROR');
  }
}

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

api.interceptors

export default api;
