# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Runtime
FROM node:20-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup --system nextjs && adduser --system nextjs --ingroup nextjs
USER nextjs

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./

# Optional: If you use environment variables, uncomment this line
# ENV NODE_ENV=production

USER nextjs

EXPOSE 3000

# Health check (simplified and lightweight)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["pnpm", "start"]