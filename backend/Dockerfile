# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/package.json
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --workspace=backend --workspace=shared

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json ./
COPY shared shared
COPY backend backend
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend
RUN npm prune --omit=dev --workspace=backend --workspace=shared

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/dist shared/dist
COPY --from=builder /app/shared/package.json shared/package.json
COPY --from=builder /app/backend/dist backend/dist
COPY --from=builder /app/backend/package.json backend/package.json
USER nodejs
EXPOSE 4000
CMD ["node", "backend/dist/index.js"]
