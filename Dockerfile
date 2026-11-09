# ---- Stage 1: build ----
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Prisma schema is needed so tsc can see the generated types
COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime
RUN apk add --no-cache openssl
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

# "prisma" CLI must be in "dependencies", not devDependencies
RUN npm ci --omit=dev && npx prisma generate && npm cache clean --force

COPY --from=build /app/dist ./dist

# Create the uploads folder owned by the non-root user,
# so the mounted volume is writable by the app
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
