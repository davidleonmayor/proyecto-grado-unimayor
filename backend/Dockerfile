FROM node:20-slim AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

COPY . .
# We generate the Prisma client before building
RUN pnpm run db:generate || npx prisma@6.18.0 generate

# We need to compile the TS files manually if there's no build script
RUN npx tsc || pnpm run build

FROM node:20-slim AS runner

WORKDIR /app

# OpenSSL is required by Prisma on Debian/Ubuntu slim images
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --prod --frozen-lockfile

# Copy the built TS files and Prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate the Prisma client in the prod image so it matches the environment
RUN npx prisma@6.18.0 generate

EXPOSE 5050
CMD ["node", "dist/index.js"]
