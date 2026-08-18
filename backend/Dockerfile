# Development-oriented image: runs the backend with tsx (no compiled dist),
# matching how it's run locally. Build context is the monorepo root so this
# image can see the shared/ workspace package.
#
# Debian slim (not alpine): Prisma's query engine needs OpenSSL, and recent
# Alpine versions don't ship libssl by default (musl vs. glibc + missing
# openssl package causes "Could not parse schema engine response" at runtime).
FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
COPY shared ./shared
COPY backend ./backend

RUN npm install

WORKDIR /app/backend
RUN npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
