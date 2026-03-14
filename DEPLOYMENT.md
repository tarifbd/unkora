# Unkora Deployment Guide

## Production Baseline

Before launch, make sure production infrastructure exists for:

- PostgreSQL with automated backups and point-in-time recovery
- MongoDB with replication enabled
- Redis with persistence and eviction alerts
- Elasticsearch with monitoring enabled
- S3 plus CloudFront for assets
- Sentry, Prometheus, and Grafana for observability

Do not deploy with a local `.env` copied from development. Production secrets should come from your secret manager and be injected at deploy time.

## Release Flow

1. Fill production secrets in your secret manager.
2. Run `node scripts/validate-production-env.mjs` against a production-safe `.env`.
3. Run `node scripts/release-readiness.mjs`.
4. Run `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
5. Build production images with `docker compose -f docker-compose.yml -f docker-compose.prod.yml build`.
6. Run database migrations before app rollout.
7. Deploy application services with rolling or blue/green strategy.
8. Verify `/health` endpoints, checkout flow, and monitoring after deploy.

## Recommended Environment Strategy

- Keep one secret bundle per environment: `staging` and `production`
- Rotate JWT, payment, and courier credentials separately
- Use production-only domains for `NEXTAUTH_URL`, `FRONTEND_URL`, and CORS settings
- Keep payment callback URLs on HTTPS only

## Launch Commands

```bash
node scripts/validate-production-env.mjs
node scripts/release-readiness.mjs
pnpm lint
pnpm typecheck
pnpm test
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
```

## Post-Deploy Verification

- `GET /health` returns `200` for every backend service
- Storefront, admin, and vendor apps load over HTTPS
- Login, add-to-cart, checkout, and order lookup succeed
- Payment webhooks arrive and are logged without sensitive payload leakage
- Sentry receives test events from each service
- Dashboards show request rate, errors, latency, and queue depth

## Rollback

1. Stop traffic to the failing release.
2. Redeploy the previous image tags.
3. Roll back database changes only if the migration is backward-incompatible and tested.
4. Re-run health checks and smoke tests.
5. Record the incident and the exact failing version.
