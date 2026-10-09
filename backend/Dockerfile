ARG SERVICE_PATH
ARG SERVICE_PORT

FROM node:20-alpine AS builder
ARG SERVICE_PATH
WORKDIR /app
COPY backend/${SERVICE_PATH}/package*.json ./
RUN npm ci
COPY backend/${SERVICE_PATH} ./
RUN npm run build

FROM node:20-alpine AS runner
ARG SERVICE_PATH
ARG SERVICE_PORT
WORKDIR /app
COPY backend/${SERVICE_PATH}/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE ${SERVICE_PORT}
CMD ["node", "dist/main.js"]
