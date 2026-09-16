FROM node:24.19.0-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=oven/bun:1.4.2-alpine /usr/local/bin/bun /usr/local/bin/bun
COPY --chown=node:node bun.lock package.json server.mjs tenant-store.mjs database.mjs security.mjs operations.mjs offers.mjs monitoring.mjs preflight.mjs quotes.mjs smtp-transport.mjs ./
RUN bun install --frozen-lockfile --production && mkdir -p /app/.data && chown node:node /app/.data
COPY --chown=node:node prototype ./prototype
USER node
EXPOSE 3001
CMD ["node", "server.mjs"]
