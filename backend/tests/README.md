# Backend likes tests

The likes count unit tests run with the normal backend test command. The likes
integration tests require a dedicated, empty PostgreSQL database named
`writers_place_likes_test`; they are skipped when `LIKES_TEST_DATABASE_URL` is
not set. Never point them at a shared or production database. The suite rejects
databases with existing tables and removes its own test tables afterward.

In PowerShell, set both URLs to the same isolated database and run:

```powershell
$env:LIKES_TEST_DATABASE_URL = 'postgres://USER:PASSWORD@localhost:5432/writers_place_likes_test'
$env:DATABASE_URL = $env:LIKES_TEST_DATABASE_URL
npm test -w backend -- tests\articleLikes.test.ts
```

The suite creates the likes table using its migration and mocks embedding calls;
it does not require the pgvector extension.

## Comments integration tests

The comments integration suite requires a separate, dedicated, empty PostgreSQL
database named `writers_place_comments_test`. It skips when
`COMMENTS_TEST_DATABASE_URL` is unset, rejects an unexpected database name or
existing tables, and removes only its own test tables. Never use a shared or
production database. In PowerShell:

```powershell
$env:COMMENTS_TEST_DATABASE_URL = 'postgres://USER:PASSWORD@localhost:5432/writers_place_comments_test'
$env:DATABASE_URL = $env:COMMENTS_TEST_DATABASE_URL
npm test -w backend -- tests\comments.test.ts
```

The suite uses the real comments migration and mocks embeddings; pgvector is not
required.
