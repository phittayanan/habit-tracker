# ==============================================================================
# Habit Tracker - backend Dockerfile for local Docker Compose (server + migrate)
# ==============================================================================
# Used by docker-compose.yml (`server` and `migrate` services).
# Cloud Run does NOT use this file; it uses the root `Dockerfile`.
# Adapted from the Lab 5 starter kit (Issue #49): this server is plain
# JavaScript, so there is no tsconfig.json; `npm run build` runs
# scripts/build.js, which copies src/ to dist/.
# Ref: https://docs.docker.com/reference/dockerfile/
# ==============================================================================

FROM node:24-alpine
WORKDIR /app
# Prisma requires openssl on alpine.
RUN apk add --no-cache openssl

# --- Install dependencies (cached until package*.json changes) ----------------
# Dev dependencies stay: the migrate service runs the prisma CLI from this image.
COPY package*.json ./
RUN npm ci

# --- Generate Prisma client ---------------------------------------------------
COPY prisma ./prisma/
RUN npx prisma generate

# --- Copy source and build (copy src/ -> dist/) -------------------------------
COPY scripts ./scripts/
COPY src ./src/
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN npm run build && chmod +x ./docker-entrypoint.sh

# --- Runtime settings (no secret here; DATABASE_URL comes from compose) -------
ENV NODE_ENV=production
ENV TZ=Asia/Bangkok
# Must match the port in docker-compose.yml. src/index.js binds 0.0.0.0.
ENV PORT=3000
EXPOSE 3000

# Run as non-root user.
USER node

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
