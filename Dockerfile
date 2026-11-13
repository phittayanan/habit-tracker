# ##############################################################################
# Habit Tracker - unified production Dockerfile (multi-stage)
# ##############################################################################
# WHAT THIS FILE DOES
#   Builds ONE image that contains the API (Express) AND the built React client
#   and serves both on port 3000 (ADR 0024). CI and Cloud Run use this image in
#   later Lab 5 steps. (client/Dockerfile and server/Dockerfile are separate,
#   used only by docker-compose for local runs.)
#   Adapted from the Lab 5 starter kit (Issue #49).
#
# STRUCTURE (3 stages)
#   Stage 1  client-builder -> builds the client (Vite) into client/dist
#   Stage 2  server-builder -> installs the server, generates the Prisma client
#                              and runs `npm run build` (copies src/ to dist/;
#                              plain JavaScript, no TypeScript)
#   Stage 3  production     -> runtime image; copies only what the server, the
#                              migration and the seed need
#
# IMPORTANT
#   * The container listens on $PORT (Cloud Run injects it; 3000 here) on
#     0.0.0.0 (server/src/index.js).
#   * Build from the repo root:  docker build .   (paths are relative to it).
#   * No secret is baked into the image (no ARG or ENV holds one). DATABASE_URL
#     and the seed passwords are supplied at run time by the platform.
#   * Stage 3 runs as the unprivileged `node` user.
#   * prisma/ is copied into the runtime image on purpose: the migration job
#     runs `prisma migrate deploy` and the seed from this same image.
#   * server/src/app.js serves the client from ../../client/dist relative to
#     itself, so /app/server/dist/app.js finds /app/client/dist.
#
# REFERENCES
#   - Multi-stage builds : https://docs.docker.com/build/building/multi-stage/
#   - Dockerfile reference: https://docs.docker.com/reference/dockerfile/
#   - Cloud Run container contract (PORT, stateless, SIGTERM):
#       https://cloud.google.com/run/docs/container-contract
#   - Prisma + Docker/alpine (openssl):
#       https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-prisma
# ##############################################################################

# ============================================================================
# Stage 1: Build the client (React + Vite)
# ============================================================================
FROM node:24-alpine AS client-builder
WORKDIR /app/client
# Copy package files first so `npm ci` is cached until dependencies change.
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
# The client calls relative /api paths on the same origin. The only build argument is
# the commit shown as the build label (ADR 0052); it is not a secret. Declared here, after
# npm ci, so the dependency layer stays cached when only the commit changes.
ARG BUILD_SHA=dev
ENV VITE_BUILD_SHA=$BUILD_SHA
RUN npm run build

# ============================================================================
# Stage 2: Build the server (Express + Prisma, plain JavaScript)
# ============================================================================
FROM node:24-alpine AS server-builder
WORKDIR /app/server
# Prisma needs openssl on alpine.
RUN apk add --no-cache openssl
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate && npm run build

# ============================================================================
# Stage 3: Production runtime (serves the API + built client on :3000)
# ============================================================================
FROM node:24-alpine AS production
WORKDIR /app/server
RUN apk add --no-cache openssl

# --- Copy build output from the previous stages ------------------------------
COPY --from=server-builder /app/server/package*.json ./
COPY --from=server-builder /app/server/node_modules ./node_modules
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/src ./src
COPY --from=server-builder /app/server/prisma ./prisma
COPY --from=server-builder /app/server/docker-entrypoint.sh ./docker-entrypoint.sh
# The built client is served by the Express server from /app/client/dist.
COPY --from=client-builder /app/client/dist /app/client/dist

RUN chmod +x ./docker-entrypoint.sh

# --- Runtime configuration ----------------------------------------------------
ENV NODE_ENV=production
ENV TZ=Asia/Bangkok
ENV PORT=3000
EXPOSE 3000

# Do not run as root inside the container.
USER node

# --- Start command ------------------------------------------------------------
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
