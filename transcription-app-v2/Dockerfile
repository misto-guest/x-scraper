# Multi-stage Dockerfile for Transcription App V2
# Build stage
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci
RUN npx prisma generate

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20 AS runner

WORKDIR /app

# Install dependencies for production only
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies and rebuild native modules
RUN npm ci --only=production
RUN npm rebuild sqlite3 --build-from-source 2>/dev/null || true

# Generate Prisma client for production
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./
# Optional: copy public directory if it exists
RUN mkdir -p ./public

# Create data directory for SQLite database
RUN mkdir -p /data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_URL="file:/data/transcription-app.db"

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js server
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "8080"]
