# Gmail Warmup V2 - Production Build
FROM node:18-alpine

WORKDIR /app

# Create necessary directories
RUN mkdir -p data logs screenshots ui

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Copy version file (forces cache rebuild)
COPY VERSION /app/VERSION

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start server
CMD ["npm", "start"]
