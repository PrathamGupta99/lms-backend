# Multi-stage Dockerfile for NestJS backend

FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 4000
ENV PORT=4000
CMD ["node", "dist/main.js"]
