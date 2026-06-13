# TrendContent

SaaS de generación automática de contenido para redes sociales basado en tendencias reales de Google.

## Flujo de deploy (GitHub → VPS)

Todo el deploy pasa por **GitHub Actions**. No hace falta buildear en local.

```
git push main → GitHub Actions → GHCR (imágenes) → VPS (Swarm update)
```

### 1. Subir el repo a GitHub

```bash
git remote add origin git@github.com:TU_USUARIO/TU_REPO.git
git push -u origin main
```

### 2. Secrets en GitHub

En **Settings → Secrets and variables → Actions**, agregar:

| Secret | Descripción |
|---|---|
| `VPS_HOST` | IP del VPS |
| `VPS_USER` | Usuario SSH (ej. `root`) |
| `VPS_SSH_KEY` | Clave privada SSH |
| `GHCR_TOKEN` | PAT de GitHub con `read:packages` |

Ver `.github/DEPLOY.md` para más detalle.

### 3. Primera vez: stack en Portainer

Deploy inicial **una sola vez** en Portainer con `docker-stack.yml`.  
**No buildear en el VPS** — las imágenes vienen de GHCR (después del primer push a `main`).

```bash
REGISTRY=ghcr.io/tu-usuario-github
TAG=latest
TRAEFIK_NETWORK=traefik_public
TRAEFIK_ENTRYPOINT=websecure
TRAEFIK_HTTP_ENTRYPOINT=web
TRAEFIK_CERT_RESOLVER=letsencryptresolver
TRAEFIK_DOMAIN=app.tu-dominio.com   # cuando lo tengas

# + resto de variables (.env.example)
```

Nombre del stack: **`trendix`** (importante: el workflow actualiza `trendix_app` y `trendix_python`).

Hacé las imágenes públicas en GHCR (**Package settings → Change visibility**) o configurá `GHCR_TOKEN` en el VPS.

### 4. Deploys automáticos

Cada `push` a `main`:
1. CI: lint + build
2. Deploy: build imágenes → push a `ghcr.io` → SSH al VPS → `docker service update`

También podés dispararlo manualmente en **Actions → Deploy → Run workflow**.

### 5. Traefik

Ver sección Traefik en deploy. Valores para tu VPS:

```bash
TRAEFIK_NETWORK=traefik_public
TRAEFIK_ENTRYPOINT=websecure
TRAEFIK_HTTP_ENTRYPOINT=web
TRAEFIK_CERT_RESOLVER=letsencryptresolver
```

### 6. Cron semanal (viernes 17:00 AR / 20:00 UTC)

En el **host del VPS**:

```bash
0 20 * * 5 curl -s -X POST "https://TU-DOMINIO/api/cron/weekly" \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

### 7. Webhook Mercado Pago

`https://TU-DOMINIO/api/webhooks/mercadopago`

---

## Desarrollo (opcional, solo código)

```bash
cp .env.example .env.local
npm install
npm run db:push
npm run dev
```

## Estructura

```
.github/workflows/  CI + Deploy automático
app/                Next.js
python-service/     FastAPI + pytrends + Claude
docker-stack.yml    Stack Swarm/Portainer
```

Variables: ver `.env.example`
