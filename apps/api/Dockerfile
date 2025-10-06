FROM node:18-alpine AS base
RUN corepack enable

FROM base AS installer
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY pnpm-workspace.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

FROM base AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY --from=installer /app .

COPY . .

RUN pnpm --filter api build

FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist /app/apps/api/dist
COPY --from=builder /app/apps/api/package.json /app/apps/api/package.json

WORKDIR /app/apps/api

RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start:prod"]