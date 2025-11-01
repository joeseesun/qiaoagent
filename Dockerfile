# Multi-stage build for Next.js + Python

FROM node:18-alpine AS base

# Install Python and build dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    python3-dev \
    build-base \
    gcc \
    musl-dev \
    libffi-dev

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install Node.js dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Python site-packages
COPY --from=deps /usr/lib/python3.11/site-packages /usr/lib/python3.11/site-packages

# Copy Next.js build output
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Python code and config
COPY --from=builder --chown=nextjs:nodejs /app/crew ./crew
COPY --from=builder --chown=nextjs:nodejs /app/api ./api
COPY --from=builder --chown=nextjs:nodejs /app/config ./config
COPY --from=builder --chown=nextjs:nodejs /app/workflows ./workflows

USER nextjs

EXPOSE 3355

ENV PORT=3355
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

