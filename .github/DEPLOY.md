# Trendix — GitHub Actions deploy

**Regla del proyecto:** nunca buildear imágenes en el VPS. Todo pasa por GitHub Actions → GHCR → `docker service update`.

Configurar en **Settings → Secrets and variables → Actions → Variables** (pestaña Variables):

| Variable | Ejemplo |
|---|---|
| `VPS_HOST` | `123.456.789.0` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | clave privada SSH completa (multilínea) |
| `GHCR_TOKEN` | PAT con `read:packages` |

Nota: `GITHUB_TOKEN` lo provee GitHub automáticamente para push a GHCR. No hace falta configurarlo.
