# =============================================================================
# @notgrahamp Digests - Production Dockerfile
# =============================================================================
# Node.js server for Astro.js app with admin panel
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Build the Astro app
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the app
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Production runtime with Node.js server
# ---------------------------------------------------------------------------
FROM node:22-alpine AS production

# Security: run as non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S astro -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from build stage
COPY --from=build --chown=astro:nodejs /app/dist ./dist
COPY --from=build --chown=astro:nodejs /app/data ./data

# Create directory for session storage
RUN mkdir -p /app/sessions && chown -R astro:nodejs /app/sessions

# Switch to non-root user
USER astro

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV ASTRO_NODE_AUTOSTART=true

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the Node.js server
CMD ["node", "dist/server/entry.mjs"]
