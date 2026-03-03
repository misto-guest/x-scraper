# Dockerfile for Supalinks 2.0 Dashboard on Fly.io
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build Astro application
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Serve the static site
CMD ["serve", "-s", "dist", "-l", "8080"]
