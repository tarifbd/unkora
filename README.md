# 🛍️ Unkora — Premium Multi-Category E-Commerce Platform

**Unkora** is a full-stack, production-grade e-commerce platform built for Bangladesh, specializing in Books, Leather Goods, Baby Products, Islamic Lifestyle, and Organic Foods.

[![CI](https://github.com/unkora/unkora/actions/workflows/ci.yml/badge.svg)](https://github.com/unkora/unkora/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

---

## 🏗️ Architecture

```
unkora/
├── apps/
│   ├── web/                  (port 3000) — Next.js 14 storefront
│   ├── admin/                (port 3001) — Admin dashboard
│   ├── vendor/               (port 3002) — Vendor portal
│   ├── api-gateway/          (port 4000) — Kong-style API gateway
│   ├── auth-service/         (port 4001) — Authentication & authorization
│   ├── product-service/      (port 4002) — Product catalog + search
│   ├── order-service/        (port 4003) — Order management
│   ├── payment-service/      (port 4004) — SSLCommerz + bKash + Nagad
│   ├── notification-service/ (port 4005) — SMS/Email/Push
│   ├── search-service/       (port 4006) — Elasticsearch search
│   ├── delivery-service/     (port 4007) — Pathao/Steadfast/RedX
│   └── marketing-service/    (port 4008) — Campaigns + Analytics
└── packages/
    ├── @unkora/types         — Shared TypeScript types
    ├── @unkora/utils         — Price, phone, date, crypto utils
    ├── @unkora/database      — Prisma + Mongoose + Redis clients
    ├── @unkora/config        — ESLint + Tailwind + TSConfig
    ├── @unkora/ui            — Shared React components
    └── @unkora/email-templates — React Email templates
```

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo 2.x, pnpm 9 |
| Frontend | Next.js 14 App Router, TypeScript 5, TailwindCSS 3, Framer Motion 11 |
| Backend | Node.js 20, Express 5, tRPC v11 |
| Primary DB | PostgreSQL 16 + Prisma 5 |
| Document DB | MongoDB 7 + Mongoose 8 |
| Cache/Queue | Redis 7 + ioredis 5 + BullMQ 5 |
| Search | Elasticsearch 8 (Bengali analyzer) |
| Auth | NextAuth.js v5, JWT RS256 + refresh rotation |
| Storage | AWS S3 + CloudFront CDN |
| Containers | Docker 25 + Kubernetes (prod) |
| CI/CD | GitHub Actions |
| Testing | Vitest 1.x + Playwright 1.x |

## 💳 Payment Gateways

| Gateway | Features |
|---------|---------|
| **SSLCommerz** | Card/Net banking, IPN webhooks, refunds |
| **bKash** | Tokenized payments, repeat purchase, refunds |
| **Nagad** | RSA-signed API, merchant checkout |
| **COD** | Zone validation, fraud scoring, auto-call |

## 🚚 Courier Integrations

- **Pathao** — Dhaka metro (OAuth2)
- **Steadfast** — Nationwide (API-Key)
- **RedX** — Tier-2 cities (Bearer token)
- **SA Paribahan** — Manual/CSV export

## 🌍 Bangladesh-Specific Features

- ✅ All 64 districts with Bengali names
- ✅ BDT pricing (stored as paisa integers)
- ✅ +880 phone format validation
- ✅ Bengali + English bilingual throughout
- ✅ Friday + BD public holiday delivery skip
- ✅ SMS via SSL Wireless (primary) + Twilio (fallback)
- ✅ Fraud detection tuned for BD COD patterns

## ⚡ Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### 1. Clone and install

```bash
git clone https://github.com/unkora/unkora.git
cd unkora
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start infrastructure

```bash
docker compose up postgres mongodb redis elasticsearch -d
```

### 4. Setup database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5. Start all services

```bash
pnpm dev
```

Services available at:
- 🌐 **Storefront**: http://localhost:3000
- 🔧 **Admin**: http://localhost:3001
- 🏪 **Vendor**: http://localhost:3002
- 🔌 **API Gateway**: http://localhost:4000

## 🏷️ Brand Guidelines

| Element | Value |
|---------|-------|
| Primary Color | Deep Amber `#B45309` |
| Secondary Color | Forest Green `#14532D` |
| Neutral | Warm Cream `#FFFBF5` |
| Heading Font | Playfair Display |
| Body Font | DM Sans |
| Bengali Font | Hind Siliguri |

## 📦 Order Number Format

`UNK-YYYYMMDD-XXXXXX` (e.g., `UNK-20241215-AB3K7P`)

## 🔐 Security Features

- JWT RS256 with 15-minute access tokens
- Refresh token rotation (30-day sliding window)
- OTP lockout after 3 failed attempts (15-min cooldown)
- Argon2id password hashing, bcrypt for PIN
- Idempotency keys on all payment operations
- Webhook signature verification (SSLCommerz, bKash, Nagad)
- S3 MIME-type whitelist
- All secrets via AWS Secrets Manager in production

## 📊 Loyalty Tiers

| Tier | Points | Discount |
|------|--------|---------|
| Bronze | 0–999 | 0% |
| Silver | 1,000–4,999 | 2% |
| Gold | 5,000–9,999 | 5% |
| Platinum | 10,000+ | 8% + Free shipping |

## 📖 Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Launch Checklist](./LAUNCH_CHECKLIST.md)
- [Bengali SEO Guide](./BANGLA_SEO.md)
- [Contributing Guide](./CONTRIBUTING.md)

---

Built with ❤️ for Bangladesh 🇧🇩
