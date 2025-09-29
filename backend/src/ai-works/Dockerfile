
FROM node:22-alpine

WORKDIR /app

COPY ../../package*.json ./

RUN npm ci

COPY . .

WORKDIR /app/src/ai-worker

RUN npm run build

# Запуск
CMD ["node", "dist/main.js"]
