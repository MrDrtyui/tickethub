# ---------- 1. Stage: builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache bash openssl

COPY package*.json ./
RUN npm ci

COPY . .

# Генерация Prisma клиента и сборка Nest
RUN npx prisma generate
RUN npm run build


# ---------- 2. Stage: runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Порты можно не хардкодить — разные сервисы будут пробрасывать свои
EXPOSE 3002 4001

# По умолчанию запускаем API (для сервиса backend)
CMD ["node", "dist/main.js"]
