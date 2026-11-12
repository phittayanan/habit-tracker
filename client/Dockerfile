# ==============================================================================
# Habit Tracker - frontend Dockerfile for local Docker Compose (Vite + nginx)
# ==============================================================================
# Used by docker-compose.yml (`client` service on http://localhost:5173).
# Cloud Run does NOT use this file — Cloud Run serves the built SPA from the
# root `Dockerfile`.
# Ref: https://docs.docker.com/build/building/multi-stage/
#
# Adapted from the Lab 5 starter kit (Issue #49): no VITE_API_URL build
# argument; the client calls relative /api paths.
# ==============================================================================

# --- Stage 1: Build static frontend files -------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy only the build inputs. The root .dockerignore does not apply to this
# build context (./client), so `COPY . .` would also copy a local node_modules
# and dist over the ones installed above.
COPY index.html vite.config.js ./
COPY src ./src/
RUN npm run build

# --- Stage 2: Serve built files with nginx (proxies /api -> server:3000) ------
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
