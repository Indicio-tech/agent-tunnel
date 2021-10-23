FROM node:17.0.1-alpine3.14 AS base
WORKDIR /app
RUN apk update && apk add yarn
COPY package.json ./
COPY yarn.lock ./
ENV NODE_ENV production
RUN yarn install --production=true

FROM node:17.0.1-alpine3.14
LABEL author="Daniel Bluhm <dbluhm@pm.me>"
LABEL description="Wrapper around localtunnel providing URL retrieval over HTTP"
WORKDIR /app

COPY --from=base /app/node_modules /app/node_modules
RUN apk update --no-cache && apk add dumb-init
USER node
COPY wait.sh /wait.sh
COPY --chown=node:node index.js ./

ENTRYPOINT ["dumb-init", "node", "./index.js"]
