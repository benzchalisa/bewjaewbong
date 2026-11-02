FROM node:22-bookworm-slim

WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY nest-cli.json tsconfig*.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate && npm run build
ENV NODE_ENV=production

RUN mkdir -p /app/data /app/uploads \
  && chown -R node:node /app/data /app/uploads
USER node

EXPOSE 3000
CMD ["sh", "-c", "npm run prisma:migrate:deploy && npm run start:prod"]
