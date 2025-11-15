# Docker Deployment Guide

This guide explains how to build and deploy the LogiMS Frontend using Docker.

## Prerequisites

- Docker installed (version 20.10 or later)
- Docker Compose installed (version 2.0 or later)

## Quick Start

### Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:3000`

### Build and Run with Docker

```bash
# Build the image
docker build -t logims-frontend .

# Run the container
docker run -d \
  --name logims-frontend \
  -p 3000:80 \
  logims-frontend
```

## Environment Variables

The frontend uses Vite environment variables. These need to be set at **build time** (not runtime) for Vite to include them in the bundle.

### Option 1: Using .env file (for docker-compose)

Create a `.env` file in the `LogiMS-FE` directory:

```env
VITE_API_BASE_URL=http://your-api-url.com/api
VITE_ENVIRONMENT=production
```

Then build with docker-compose:
```bash
docker-compose build
docker-compose up -d
```

### Option 2: Using build arguments (for docker build)

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://your-api-url.com/api \
  --build-arg VITE_ENVIRONMENT=production \
  -t logims-frontend .
```

**Note:** You'll need to modify the Dockerfile to accept build args if using this approach. See "Advanced Configuration" below.

### Option 3: Runtime configuration (Recommended for production)

For true runtime configuration, you would need to:
1. Serve a `config.js` file that gets loaded at runtime
2. Or use a backend endpoint to provide configuration
3. Or use environment-specific builds

## Production Deployment

### Build for Production

```bash
# Build the image
docker build -t logims-frontend:latest .

# Tag for registry (replace with your registry)
docker tag logims-frontend:latest your-registry.com/logims-frontend:latest

# Push to registry
docker push your-registry.com/logims-frontend:latest
```

### Run in Production

```bash
docker run -d \
  --name logims-frontend \
  -p 80:80 \
  --restart unless-stopped \
  your-registry.com/logims-frontend:latest
```

## Advanced Configuration

### Using Build Arguments

If you want to pass environment variables as build arguments, modify the Dockerfile:

```dockerfile
# In the builder stage, add:
ARG VITE_API_BASE_URL
ARG VITE_ENVIRONMENT
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
```

Then build with:
```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://api.example.com/api \
  --build-arg VITE_ENVIRONMENT=production \
  -t logims-frontend .
```

### Custom Nginx Configuration

The `nginx.conf` file can be customized for your needs:
- SSL/TLS configuration
- Custom headers
- Proxy settings
- Rate limiting

After modifying `nginx.conf`, rebuild the image.

### Health Checks

The container includes a health check endpoint at `/health`. You can monitor it with:

```bash
docker inspect --format='{{.State.Health.Status}}' logims-frontend
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs logims-frontend

# Check if port is already in use
netstat -an | grep 3000  # Linux/Mac
netstat -ano | findstr 3000  # Windows
```

### Build fails

```bash
# Clear Docker cache and rebuild
docker build --no-cache -t logims-frontend .
```

### Environment variables not working

Remember: Vite environment variables must be available at **build time**, not runtime. They are embedded in the JavaScript bundle during the build process.

## Integration with Backend

When deploying with the backend, ensure:
1. CORS is properly configured on the backend
2. The `VITE_API_BASE_URL` points to the correct backend URL
3. Both services are on the same network (if using docker-compose) or CORS allows the frontend domain

Example docker-compose with both services:

```yaml
version: '3.8'

services:
  backend:
    # ... backend configuration

  frontend:
    build:
      context: ./LogiMS-FE
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: http://backend:8000/api
    ports:
      - "3000:80"
    depends_on:
      - backend
```

