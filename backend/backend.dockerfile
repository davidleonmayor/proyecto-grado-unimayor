FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl

RUN npm install -g pnpm

WORKDIR /app

# Copiar los manifests de dependencias
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY prisma ./prisma
# RUN pnpx prisma migrate dev # this create a new migration file with the current schema
RUN pnpx prisma generate

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm run dev"]
# CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm run seed && pnpm run dev"]

