# TrendContent — GitHub Actions deploy

**Regla del proyecto:** nunca buildear imágenes en el VPS. Todo pasa por GitHub Actions → GHCR → `docker service update`.

Copiar a Settings → Secrets and variables → Actions

# VPS SSH
VPS_HOST=123.456.789.0
VPS_USER=root
VPS_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...

# GitHub PAT con read:packages (para que el VPS pueda pull de GHCR)
# Settings → Developer settings → Personal access tokens
GHCR_TOKEN=ghp_...
