# ─────────────────────────────────────────────────────────────
# Teemie The Visa Girlie — Production Dockerfile
# Zero npm dependencies · Pure Node.js built-ins only
# ─────────────────────────────────────────────────────────────

FROM node:20-alpine

LABEL maintainer="Teemie The Visa Girlie"
LABEL description="Travel consultant portfolio — single-file Node.js server"

WORKDIR /app

# Copy the single server file (no package.json needed)
COPY server.js .

# Create data directory for persistent content storage
RUN mkdir -p /data && chown node:node /data /app

# Run as non-root for security
USER node

# Ports & volumes
EXPOSE 3000
VOLUME ["/data"]

# Environment — override at runtime
ENV PORT=3000
ENV ADMIN_PASSWORD=teemie2026
ENV DATA_FILE=/data/content.json

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/ > /dev/null || exit 1

CMD ["node", "server.js"]

# ─────────────────────────────────────────────────────────────
# QUICK START
# ─────────────────────────────────────────────────────────────
# Build:
#   docker build -t teemie-site .
#
# Run (development):
#   docker run -p 3000:3000 teemie-site
#
# Run (production — persistent data + custom password):
#   docker run -d \
#     -p 3000:3000 \
#     -e ADMIN_PASSWORD=YourSecurePassword123 \
#     -v teemie-data:/data \
#     --name teemie \
#     --restart unless-stopped \
#     teemie-site
#
# Run without Docker:
#   node server.js
#   ADMIN_PASSWORD=secret PORT=8080 node server.js
#
# Behind nginx (recommended for HTTPS):
#   proxy_pass http://localhost:3000;
# ─────────────────────────────────────────────────────────────
