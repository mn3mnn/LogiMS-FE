# Multi-stage build for production-ready React app

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL=http://localhost:8000/api
ARG VITE_ENVIRONMENT=production

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
# Vite will output to 'dist' directory by default
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check - use curl with /health endpoint (curl works, wget has IPv6 issues)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1/health >/dev/null 2>&1 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

