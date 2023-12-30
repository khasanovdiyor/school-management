FROM node:16-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY --chown=node:node . .
RUN npm run build \
  && npm prune --production

# ---

FROM node:16-alpine As production

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=development --chown=node:node /usr/src/app/package*.json ./
COPY --from=development --chown=node:node /usr/src/app/node_modules/ ./node_modules/
COPY --from=development --chown=node:node /usr/src/app/dist ./dist

CMD ["node", "dist/main"]