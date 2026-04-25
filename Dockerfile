# ── Stage 1: Builder ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# ── Stage 2: Production Image ──────────────────────────────
FROM node:20-alpine

# Create non-root user for security
RUN addgroup -S botgroup && adduser -S botuser -G botgroup

WORKDIR /app

# Copy built node_modules and source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Set ownership
RUN chown -R botuser:botgroup /app

USER botuser

# Expose port (used in webhook mode)
EXPOSE 3000

# Default: webhook mode. Override with: docker run ... node polling.js
CMD ["node", "server.js"]
