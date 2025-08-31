# Imagen base con Node 22 y Alpine (ligera)
FROM node:22-alpine AS base

# -----------------------------
# Etapa 1: deps (instalar dependencias)
# -----------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar lockfile y manifest
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Instalar dependencias con pnpm
RUN pnpm install --frozen-lockfile

# -----------------------------
# Etapa 2: builder (compilar Next.js)
# -----------------------------
FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm   # instalarlo aquí también

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# -----------------------------
# Etapa 3: runner (producción)
# -----------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copiar public y artefactos de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
