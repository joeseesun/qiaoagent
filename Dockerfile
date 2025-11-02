# Multi-stage build for Next.js + Python

FROM node:18-slim AS base

# Install Python and build dependencies
# Include SQLite3 for ChromaDB and other system libraries
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    wget \
    curl \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/bin/python3 /usr/bin/python

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install Python dependencies FIRST (changes less frequently)
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages \
    --timeout=300 --retries=10 \
    -r requirements.txt

# Install Node.js dependencies SECOND
COPY package.json package-lock.json* ./
# Use npm install with network optimizations for better stability
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install --legacy-peer-deps --no-audit --no-fund

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

# Set environment variables for Python and ChromaDB
ENV PYTHONUNBUFFERED=1
ENV ALLOW_RESET=TRUE
ENV IS_PERSISTENT=TRUE

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 -g nodejs nextjs --create-home

# Copy Python dependencies from deps stage
# Copy the entire Python lib directory to ensure all packages are included
COPY --from=deps /usr/local/lib/python3.11 /usr/local/lib/python3.11

# Copy Next.js build output and public files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Python code and config
COPY --from=builder --chown=nextjs:nodejs /app/crew ./crew
COPY --from=builder --chown=nextjs:nodejs /app/api ./api
COPY --from=builder --chown=nextjs:nodejs /app/config ./config

# Ensure Python packages are readable by nextjs user
RUN chmod -R 755 /usr/local/lib/python3.11

# Create and set permissions for CrewAI data directory
RUN mkdir -p /home/nextjs/.local/share && \
    chown -R nextjs:nodejs /home/nextjs

USER nextjs

EXPOSE 3355

ENV PORT=3355
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

