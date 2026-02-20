FROM node:22-slim

# Instalar openssl
RUN apt-get update -y && \
    apt-get install -y openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependencias
RUN pnpm install

# Copiar el resto del código
COPY . .

# Generar Prisma client
RUN pnpm exec prisma generate

# Exponer puerto
EXPOSE 4000

# Comando de inicio
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm run dev"]
