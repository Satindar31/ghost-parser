# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN yarn install

# Copy all source files (including src, prisma, public, next config)
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN yarn build


# ---- Stage 2: Production ----
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only what's needed for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/src ./src
COPY start.sh ./start.sh

RUN chmod +x ./start.sh

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["./start.sh"]