FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl

RUN npm install -g pnpm

WORKDIR /app

# Copiar los manifests de dependencias
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY prisma ./prisma
RUN pnpx prisma generate

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "pnpx prisma generate && pnpm run dev"]
