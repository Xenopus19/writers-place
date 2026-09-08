import cors from 'cors';
import express from 'express';
import type { ApiResponse, User } from '@writers-place/shared';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const response: ApiResponse<{ status: string }> = { data: { status: 'ok' } };
  res.json(response);
});

app.get('/api/users/me', (_req, res) => {
  const user: User = { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' };
  const response: ApiResponse<User> = { data: user };
  res.json(response);
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}
