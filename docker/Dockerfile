FROM node:21-alpine as build

WORKDIR /app

COPY . .

RUN pnpm install

RUN pnpm run build

FROM node:21-alpine

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install

COPY --from=build /app/dist /app/dist
CMD ["node", "dist/index.js"]
