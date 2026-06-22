FROM oven/bun:1.3.4-alpine AS deps
WORKDIR /repo
COPY package.json bun.lock ./
COPY apps/frontend/package.json ./apps/frontend/
RUN bun install --frozen-lockfile

FROM oven/bun:1.3.4-alpine AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/frontend/node_modules ./apps/frontend/node_modules
COPY . .
WORKDIR /repo/apps/frontend
ARG BACKEND_URL=http://backend:8000
ENV BACKEND_URL=${BACKEND_URL}
RUN bun run build

FROM oven/bun:1.3.4-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/frontend ./apps/frontend
WORKDIR /repo/apps/frontend
EXPOSE 3000
CMD ["bun", "run", "start"]
