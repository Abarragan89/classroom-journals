# syntax=docker.io/docker/dockerfile:1

FROM node:18-alpine AS base

# Install system deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# === Install dependencies ===
FROM base AS deps

# Install build tools temporarily
RUN apk add --no-cache --virtual .build-deps python3 make g++ && \
    apk add --no-cache --virtual .gyp py-setuptools

COPY . .
# COPY package.json package-lock.json ./
# COPY prisma ./prisma

# Use the arg temporarily for Prisma
RUN DATABASE_URL=$DATABASE_URL npx prisma generate
RUN DATABASE_URL=$DATABASE_URL npx prisma migrate deploy

# RUN --mount=type=secret, id=DATABASE_URL \
#     --mount=type=secret, id=AUTH_SECRET \ 
#     --mount=type=secret, id=AUTH_URL \ 
#     --mount=type=secret, id=AUTH_GOOGLE_ID \ 
#     --mount=type=secret, id=AUTH_GOOGLE_SECRET \ 
#     --mount=type=secret, id=ENCRYPTION_KEY \ 
#     --mount=type=secret, id=OPENAI_API_KEY\ 
#     --mount=type=secret, id=NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \ 
#     --mount=type=secret, id=STRIPE_SECRET_KEY \ 
#     --mount=type=secret, id=STRIPE_WEBHOOK_SECRET \ 
#     --mount=type=secret, id=NEXT_PUBLIC_BASE_URL \ 
#     --mount=type=secret, id=NEXT_PUBLIC_STANDARD_SUBSCRIPTION_LINK \ 
#     --mount=type=secret, id=NEXT_PUBLIC_PREMIUM_SUBSCRIPTION_LINK \ 
#     --mount=type=secret, id=SENDGRID_API_KEY \ 
#     --mount=type=secret, id=SENDGRID_ACCOUNT_EMAIL \ 
#     --mount=type=s ecret, id=AWS_S3_REGION \ 
#     --mount=type=secret, id=AWS_S3_ACCESS_KEY_ID \ 
#     --mount=type=secret, id=AWS_S3_SECRET_ACCESS_KEY\ 
#     --mount=type=secret, id=AWS_S3_BUCKET_NAME \ 
#     npm ci

RUN npm ci

# Remove build tools
RUN apk del .build-deps

# === Build app ===
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# === Final prod image ===
FROM base AS runner

WORKDIR /app

# Add unprivileged user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
