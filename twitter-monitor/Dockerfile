# Dockerfile for Twitter Monitor on Fly.io
FROM node:20

# Install build dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema before installing
COPY prisma ./prisma/

# Install dependencies (will run prisma generate)
RUN npm ci

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

EXPOSE 3000

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
