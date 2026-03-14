# 🚀 Unkora Production Launch Checklist

## 1. Infrastructure & Cloud (AWS)
- [ ] EC2 / ECS cluster provisioned (min 3 nodes for HA)
- [ ] RDS PostgreSQL 16 Multi-AZ enabled
- [ ] MongoDB Atlas M10+ tier with replica set
- [ ] ElastiCache Redis 7 cluster mode
- [ ] Elasticsearch Service 8.x (2 nodes minimum)
- [ ] S3 bucket created with versioning + lifecycle policies
- [ ] CloudFront distribution configured, SSL cert attached
- [ ] VPC + private subnets for all databases
- [ ] Security Groups: only required ports open
- [ ] IAM roles with least-privilege permissions
- [ ] AWS Secrets Manager for all secrets
- [ ] Route53 + ACM certificate for unkora.com

## 2. Database
- [ ] `prisma migrate deploy` run on production DB
- [ ] Database indexes verified (check `EXPLAIN ANALYZE` on slow queries)
- [ ] Seed only reference data (delivery zones, categories) — NOT test data
- [ ] Backup schedule: hourly snapshots, 30-day retention
- [ ] pg_dump + mongodump to S3 tested
- [ ] Connection pooling via PgBouncer configured
- [ ] Read replicas configured for product/search queries
- [ ] Monitoring alerts for CPU > 80%, storage > 75%

## 3. Security
- [ ] All secrets in AWS Secrets Manager (no .env in production)
- [ ] JWT RS256 private key generated and stored securely
- [ ] CORS whitelist matches production domains only
- [ ] Rate limiting verified on all auth endpoints
- [ ] OTP lockout tested (3 attempts → 15 min lockout)
- [ ] SSL/TLS A+ rating on SSL Labs
- [ ] HSTS headers configured
- [ ] CSP headers reviewed and tightened
- [ ] SQL injection tested (Prisma parameterizes, but verify)
- [ ] XSS protection: all user content sanitized
- [ ] Dependency audit: `pnpm audit --audit-level=high`
- [ ] Webhook signature verification (SSLCommerz, bKash, Nagad) tested

## 4. Payment Gateways
- [ ] SSLCommerz: switch `IS_LIVE=true`, verify IPN URL is reachable
- [ ] bKash: production credentials, test live token flow
- [ ] Nagad: production RSA keys, verify callback URLs
- [ ] COD: fraud scoring thresholds reviewed
- [ ] All payment webhooks fire-and-forget with idempotency keys
- [ ] Refund flow tested end-to-end
- [ ] Payment logs never include raw card data

## 5. SMS & Email
- [ ] SSL Wireless production account activated, sender ID approved
- [ ] Twilio fallback configured and tested
- [ ] AWS SES production access (out of sandbox), domain verified
- [ ] Email SPF, DKIM, DMARC DNS records set
- [ ] OTP delivery tested on real Bangladesh numbers
- [ ] Order confirmation email tested with real order

## 6. SEO & Performance
- [ ] sitemap.xml accessible at /sitemap.xml
- [ ] robots.txt verified
- [ ] Google Search Console domain verified
- [ ] Lighthouse CI: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms
- [ ] og:image tags on all product/category pages
- [ ] JSON-LD structured data validated with Google's Rich Results Test
- [ ] Bengali (bn_BD) hreflang configured
- [ ] ISR cache-control headers verified

## 7. Monitoring & Observability
- [ ] Sentry DSN configured for all services
- [ ] Prometheus scraping all service /metrics endpoints
- [ ] Grafana dashboards imported and operational
- [ ] Loki log aggregation running
- [ ] Alerts configured:
  - [ ] Error rate > 1% triggers PagerDuty
  - [ ] P95 response time > 2s alerts
  - [ ] Redis memory > 80% alerts
  - [ ] Failed payment rate > 5% alerts
- [ ] Uptime monitoring (UptimeRobot or similar) on all service health endpoints
- [ ] Log retention policy set (30 days application, 90 days security)

## 8. CI/CD & Deployment
- [ ] CI pipeline green on main branch
- [ ] Docker images built with non-root user
- [ ] Container resource limits set (CPU/Memory)
- [ ] Health checks passing for all services
- [ ] Zero-downtime deployment verified (rolling update)
- [ ] Rollback procedure documented and tested
- [ ] `pnpm db:migrate` run before service deployment
- [ ] Feature flags system ready for gradual rollout

## 9. Bangladesh-Specific
- [ ] All 64 district delivery zones seeded
- [ ] COD availability per district verified
- [ ] Pathao courier: production API credentials, store configured
- [ ] Steadfast courier: production API key
- [ ] RedX courier: production bearer token
- [ ] Bangladesh public holidays 2025 in utils verified
- [ ] Price display in BDT (paisa stored, taka displayed with ৳ symbol)
- [ ] Bengali font (Hind Siliguri) loading correctly on all devices
- [ ] Phone number format (+8801XXXXXXXXX) validation tested
- [ ] Customer support number visible and active (+880...)

## 10. Legal & Compliance
- [ ] Privacy Policy page published (GDPR + Bangladesh Data Protection)
- [ ] Terms of Service published
- [ ] Return/Refund Policy page published
- [ ] Cookie consent banner implemented
- [ ] Business registration documents uploaded to about/legal page
- [ ] Payment gateway agreements signed
- [ ] Trade license displayed

## 11. Final Pre-Launch
- [ ] Full end-to-end order flow tested with real payment (bKash sandbox → live)
- [ ] Mobile (Android/iOS) responsiveness verified
- [ ] Low bandwidth simulation tested (2G/3G common in rural BD)
- [ ] Browser test: Chrome, Firefox, Samsung Internet (common in BD)
- [ ] Load test: simulate 1000 concurrent users
- [ ] Social media pages created (Facebook, Instagram, YouTube)
- [ ] Google Merchant Center product feed submitted
- [ ] Facebook Business Manager connected with Pixel verified
- [ ] Google Analytics 4 event tracking verified

---

**Target Launch**: All ✅ before going live.  
**Emergency contacts**: Tech Lead, Payment Gateway Support, Courier API support numbers.
