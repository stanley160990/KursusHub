# ====================================================================
# Dockerfile for KursusHub Application
# Copyright 2026 - halkh-systems.com
# ====================================================================

FROM node:lts-alpine3.24 AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy application source code
COPY . .

# Build the frontend assets
RUN npm run build

# Stage 2: Production Runner
FROM node:lts-alpine3.24 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install runtime dependencies
RUN apk add --no-cache curl

# Copy application and built artifacts from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/init-db.sql ./init-db.sql
COPY --from=builder /app/index.html ./index.html

# Expose dynamic application port
EXPOSE 3000

# Healthcheck to ensure container is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

# Start full-stack Node server
CMD ["npm", "run", "start"]
