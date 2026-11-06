# Backend API

## Article comments

- `GET /api/articles/:articleId/comments` is public and returns all comments,
  newest first (descending ID breaks timestamp ties).
- `POST /api/articles/:articleId/comments` requires a bearer token and accepts
  `{ "text": "..." }`. Text is trimmed and must contain 1–150 characters.
  The response is `201` with `{ "data": comment }`.
- Each comment has `id`, `articleId`, `userId`, `text`, `createdAt`, and `user`
  with `id`, `username`, `name`, and `avatarUrl`. The token identifies the
  author; a user may comment on the same article more than once.
- Malformed article UUIDs return `400`; missing articles return `404`.
  Article detail, update, and delete routes also validate UUIDs this way.

See [backend test setup](./tests/README.md) for running the integration tests.
