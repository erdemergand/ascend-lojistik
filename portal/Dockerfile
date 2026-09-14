FROM node:24.19.0-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --chown=node:node package.json server.mjs tenant-store.mjs ./
COPY --chown=node:node prototype ./prototype
USER node
EXPOSE 3001
CMD ["node", "server.mjs"]
