FROM node:20.10.0-bullseye-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y yarn && apt-get clean
COPY package.json ./
COPY yarn.lock ./
ENV NODE_ENV production
RUN yarn install --production=true

FROM node:20.10.0-bullseye-slim
LABEL author="Daniel Bluhm <dbluhm@pm.me>"
LABEL description="Wrapper around localtunnel providing URL retrieval over HTTP"
WORKDIR /app

COPY --from=base /app/node_modules /app/node_modules
RUN apt-get update && apt-get install dumb-init
USER node
COPY wait.sh /wait.sh
COPY --chown=node:node index.js ./

ENTRYPOINT ["dumb-init", "node", "./index.js"]
