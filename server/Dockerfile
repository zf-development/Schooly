FROM node:20-alpine AS base

WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm install --production --frozen-lockfile 2>/dev/null || npm install --production
RUN npm cache clean --force

FROM base AS builder
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build 2>/dev/null || echo "No build script"

FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app .

EXPOSE 4000

# Healthcheck corrigé pour Node.js
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["npm", "start"]
