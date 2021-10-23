FROM alpine
RUN apk update && apk add yarn

WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production=true
COPY index.js ./

ENTRYPOINT ["yarn", "node", "./index.js"]
