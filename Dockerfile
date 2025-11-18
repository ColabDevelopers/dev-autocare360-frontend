# ---------- STAGE 1: BUILD ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only dependency files first (cache layer)
COPY package.json pnpm-lock.yaml ./

# Install dependencies (fast cached layer)
RUN pnpm fetch

# Copy the rest of the source code
COPY . .

# Build Next.js (standalone output)
RUN pnpm install --offline && pnpm build


# ---------- STAGE 2: RUNTIME ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup --system nextjs && adduser --system nextjs --ingroup nextjs

# Set environment
ENV NODE_ENV=production

# Copy standalone Next.js output
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
