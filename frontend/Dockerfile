# Development-oriented image: runs the Vite dev server. Build context is
# the monorepo root so this image can see the shared/ workspace package.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY shared ./shared
COPY frontend ./frontend

RUN npm install

WORKDIR /app/frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
