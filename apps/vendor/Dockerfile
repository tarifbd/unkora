FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat && npm install -g pnpm@9
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/vendor/package.json ./apps/vendor/
RUN pnpm install --frozen-lockfile

FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/vendor
EXPOSE 3002
CMD ["pnpm", "dev"]

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm turbo build --filter=@unkora/vendor

FROM node:20-alpine AS production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
WORKDIR /app
COPY --from=builder /app/apps/vendor/.next/standalone ./
COPY --from=builder /app/apps/vendor/.next/static ./apps/vendor/.next/static
COPY --from=builder /app/apps/vendor/public ./apps/vendor/public
USER nextjs
EXPOSE 3002
ENV PORT 3002
CMD ["node", "apps/vendor/server.js"]
