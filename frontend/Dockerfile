# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Set Env for build (can be overridden, but needed for build time statically optimized pages)
ENV NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
ENV NEXT_PUBLIC_SUPABASE_URL=REPLACE_ME_AT_BUILD_TIME
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=REPLACE_ME_AT_BUILD_TIME
RUN npm run build

# Stage 2: Run
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
