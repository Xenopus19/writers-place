# Writers Place

## GitHub Actions and Render deployment

The [build and deploy workflow](.github/workflows/build-and-deploy.yml) builds
all workspaces on pull requests targeting `main` and on pushes to `main`.
After a successful build on `main`, it triggers the frontend and backend Render
deploy hooks independently, specifying the commit that passed the build.
The workflow reports whether Render accepted each request; it does not wait for
the Render builds or deployments to finish.

Configure two Git-backed Render services connected to this repository and the
`main` branch. For both, leave **Root Directory** empty so npm can access the
workspace root and the shared package, set `NODE_VERSION` to `24`, and turn
**Auto-Deploy** off so pushes cannot bypass the GitHub Actions build. Render
builds the commit again; GitHub Actions does not upload build artifacts.

### Backend web service

- Build command: `npm ci --include=dev && npm run build -w packages/shared && npm run build -w backend`
- Start command: `npm run start -w backend`
- Health check path: `/api/health`
- Configure `DATABASE_URL`, `JWT_SECRET`, and any required Cloudflare R2
  variables in Render. The PostgreSQL database must support the `vector`
  extension. The backend connects to the database and runs migrations on
  startup.

On a new database, the existing migration filenames sort the genres migration
before the users and articles migrations it depends on. Correct the migration
ordering before relying on startup to initialize a new database.

### Frontend static site

- Set `SKIP_INSTALL_DEPS` to `true` to use the explicit install command.
- Build command: `npm ci --include=dev && npm run build -w packages/shared && npm run build -w frontend`
- Publish directory: `frontend/dist`
- Set `VITE_BACKEND_URL` to the backend's public origin, without `/api` or a
  trailing slash. This value is embedded in the frontend during the Render
  build.
- Add a rewrite rule from `/*` to `/index.html` for client-side routing.

In the Render dashboard, copy each service's deploy hook URL and add these
repository secrets under GitHub **Settings > Secrets and variables > Actions**:

- `RENDER_FRONTEND_DEPLOY_HOOK`: static site's deploy hook URL.
- `RENDER_BACKEND_DEPLOY_HOOK`: web service's deploy hook URL.

Treat deploy hook URLs as secrets: anyone with a URL can trigger a deployment.
If a hook is regenerated in Render, update its corresponding GitHub secret.
