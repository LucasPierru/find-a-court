# Infra

## Local Docker parity check

```
docker compose up --build
```

Not the day-to-day dev loop (keep using `npm run dev` from a native Windows
terminal for that per repo conventions) - this is for validating the
Dockerfiles/prod images before pushing.

## CI (`.github/workflows/ci.yml`)

Runs on every PR and push to `main`: builds `shared`, then typechecks, lints,
and builds `backend` and `frontend`. No setup required.

## Deploy (`.github/workflows/deploy.yml`)

On push to `main`, builds both Docker images and pushes them to GHCR as
`ghcr.io/<owner>/find-a-court-backend` / `-frontend`, tagged `latest` and the
commit SHA. The deploy-to-VPS job runs under the `Production` GitHub
Environment and stays a no-op until you provision a server:

1. Provision any VPS (DigitalOcean, Hetzner, etc.), install Docker + the
   Compose plugin on it.
2. On the server, create a directory to hold the compose file (e.g.
   `/srv/find-a-court`) and, inside it, a `backend.env` file with the
   backend's runtime env vars (start from `backend/.env.example`).
3. Create a GitHub Environment named `Production` (Settings -> Environments
   -> New environment) and add these to **its** secrets/variables - only the
   `deploy` job (which declares `environment: Production`) can see them:
   - `SSH_HOST` - server IP/hostname
   - `SSH_USER` - SSH user (needs Docker permissions)
   - `SSH_PRIVATE_KEY` - private key matching a key authorized on the server
   - `SSH_PORT` - optional, defaults to 22
   - `DEPLOY_PATH` - the directory from step 2, e.g. `/srv/find-a-court`
   - `GHCR_DEPLOY_TOKEN` - a GitHub PAT (classic or fine-grained) with
     `read:packages`, used by the server to `docker login ghcr.io` and pull
     images. Skippable if you instead make the two GHCR packages public
     (package settings -> Change visibility) - drop the `docker login` line
     from the workflow's ssh step in that case.
   - `DEPLOY_ENABLED` (variable, not secret) = `true`
4. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` as a plain **repository** secret
   instead (Settings -> Secrets and variables -> Actions -> Secrets tab, no
   Environment) - it's consumed by `build-and-push`, which isn't bound to the
   `Production` environment, so an environment-scoped copy is invisible to it
   and silently resolves empty. It's baked into the frontend build (Next
   inlines `NEXT_PUBLIC_*` vars at build time, so this has to be a build arg,
   not a server-side env var).
5. Push to `main` - the workflow builds, pushes, copies
   `docker-compose.prod.yml` to the server, and runs
   `docker compose pull && up -d`.

Note: if the `Production` environment has protection rules configured
(required reviewers, wait timer), every deploy will pause for approval per
those rules - expected, not a bug, if you set that up intentionally.

To roll back manually, SSH in and run:

```
docker compose -f docker-compose.prod.yml pull ghcr.io/<owner>/find-a-court-backend:<old-sha>
```

or edit the image tags in `docker-compose.prod.yml` on the server directly.
