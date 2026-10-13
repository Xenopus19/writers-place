export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Article<T> {
  data: T;
  error?: string;
}
