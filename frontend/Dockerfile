# syntax=docker/dockerfile:1
#
# Build context is the repo root (npm workspaces need every workspace's
# package.json present to resolve the lockfile), e.g.:
#   docker build -f frontend/Dockerfile \
#     --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
#     -t find-a-court-frontend .

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/package.json
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci --workspace=frontend --workspace=shared

FROM node:20-alpine AS builder
WORKDIR /app
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so
# they have to be supplied as build args, not runtime env vars.
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json ./
COPY shared shared
COPY frontend frontend
RUN npm run build --workspace=shared
RUN npm run build --workspace=frontend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
# Monorepo standalone output nests the server entrypoint under the app's
# workspace dir (frontend/server.js) rather than at the tree root.
COPY --from=builder /app/frontend/public frontend/public
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static frontend/.next/static
USER nodejs
EXPOSE 3000
CMD ["node", "frontend/server.js"]
