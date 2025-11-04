# Multi-stage build for Nuxt.js application optimized for Railway

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application files
COPY . .

# Build the application
RUN pnpm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set production environment
ENV NODE_ENV=production
# PORT will be set by Railway automatically
ENV HOST=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod && \
    pnpm store prune

# Copy built application from builder stage
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output

# Switch to non-root user
USER nuxtjs

# Expose port (Railway will set PORT environment variable)
EXPOSE $PORT

# Health check - Railway will check this endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000), (r) => {process.exit(r.statusCode < 500 ? 0 : 1)})"

# Start the application
# Nuxt 4 creates a server in .output/server/index.mjs even with SSR=false
# The server will serve the SPA application
CMD ["node", ".output/server/index.mjs"]

