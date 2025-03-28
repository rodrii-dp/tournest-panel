FROM node:lts as dependencies
WORKDIR /tournest-panel
COPY package.json package-lock.json ./
RUN npm ci

FROM node:lts as builder
WORKDIR /tournest-panel
COPY . .
COPY --from=dependencies /tournest-panel/node_modules ./node_modules
RUN npm run build

FROM node:lts as runner
WORKDIR /tournest-panel
ENV NODE_ENV production
# If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /tournest-panel/next.config.js ./
COPY --from=builder /tournest-panel/public ./public
COPY --from=builder /tournest-panel/.next ./.next
COPY --from=builder /tournest-panel/node_modules ./node_modules
COPY --from=builder /tournest-panel/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]