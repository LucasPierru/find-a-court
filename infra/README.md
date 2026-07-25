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
commit SHA. The deploy-to-VPS job is gated behind a repo variable and stays a
no-op until you provision a server:

1. Provision any VPS (DigitalOcean, Hetzner, etc.), install Docker + the
   Compose plugin on it.
2. On the server, create a directory to hold the compose file (e.g.
   `/srv/find-a-court`) and, inside it, a `backend.env` file with the
   backend's runtime env vars (start from `backend/.env.example`).
3. In the GitHub repo, add these **secrets** (Settings -> Secrets and
   variables -> Actions -> Secrets):
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
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - baked into the frontend build (Next
     inlines `NEXT_PUBLIC_*` vars at build time, so this has to be a build
     arg, not a server-side env var)
4. Add a repo **variable** (same Settings page, Variables tab):
   - `DEPLOY_ENABLED` = `true`
5. Push to `main` - the workflow builds, pushes, copies
   `docker-compose.prod.yml` to the server, and runs
   `docker compose pull && up -d`.

To roll back manually, SSH in and run:

```
docker compose -f docker-compose.prod.yml pull ghcr.io/<owner>/find-a-court-backend:<old-sha>
```

or edit the image tags in `docker-compose.prod.yml` on the server directly.
