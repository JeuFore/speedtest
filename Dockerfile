FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY . .

COPY package*.json ./

RUN yarn install

RUN yarn build


FROM node:22-alpine

WORKDIR /app

COPY --from=builder /usr/src/app/dist /app

RUN apk add --no-cache iperf3

CMD [ "node", "index.js" ]