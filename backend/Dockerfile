# Development-oriented image: runs the backend with tsx (no compiled dist),
# matching how it's run locally. Build context is the monorepo root so this
# image can see the shared/ workspace package.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY shared ./shared
COPY backend ./backend

RUN npm install

WORKDIR /app/backend
RUN npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
