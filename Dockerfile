# ---- Stage 1: build the React frontend ----
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: install backend production deps ----
FROM node:22-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev

# ---- Stage 3: final runtime image ----
FROM node:22-alpine
WORKDIR /app

COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
COPY serve-static.js ./serve-static.js
COPY start.sh ./start.sh

RUN mkdir -p /app/db && chmod +x ./start.sh

ENV PORT=8090
ENV STATIC_PORT=9080
ENV STATIC_DIR=/app/frontend/dist
ENV DB_PATH=/app/db/medidash.db

EXPOSE 8090 9080

CMD ["./start.sh"]
