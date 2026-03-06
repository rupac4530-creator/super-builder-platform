FROM node:20-alpine AS base
WORKDIR /app

# Backend build
FROM base AS backend-deps
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

FROM base AS frontend-deps
COPY platform/package*.json ./platform/
RUN cd platform && npm ci

# Final image
FROM base AS runner
RUN apk add --no-cache tini

COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules
COPY --from=frontend-deps /app/platform/node_modules ./platform/node_modules

COPY backend/ ./backend/
COPY platform/ ./platform/
COPY .env.example ./.env

ENV NODE_ENV=production
ENV PORT=3001
ENV FRONTEND_URL=http://localhost:3000

EXPOSE 3000 3001

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/docker-entrypoint.sh"]
