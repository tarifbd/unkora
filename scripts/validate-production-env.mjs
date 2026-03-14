#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env");

if (!fs.existsSync(envPath)) {
  console.error("Missing .env file. Copy .env.example to .env before validating production settings.");
  process.exit(1);
}

const raw = fs.readFileSync(envPath, "utf8");
const env = {};

for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex === -1) continue;
  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1");
  env[key] = value;
}

const requiredVars = [
  "NODE_ENV",
  "INTERNAL_API_SECRET",
  "DATABASE_URL",
  "MONGODB_URI",
  "REDIS_URL",
  "ELASTICSEARCH_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_PRIVATE_KEY",
  "JWT_PUBLIC_KEY",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_S3_BUCKET",
  "AWS_CLOUDFRONT_URL",
  "SENTRY_DSN",
  "CORS_ORIGIN",
  "ALLOWED_ORIGINS",
  "FRONTEND_URL",
  "PAYMENT_SERVICE_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SSL_WIRELESS_API_TOKEN",
  "SSL_WIRELESS_SENDER_ID_TRANSACTIONAL",
  "SSLCOMMERZ_STORE_ID",
  "SSLCOMMERZ_STORE_PASSWORD",
  "SSLCOMMERZ_SUCCESS_URL",
  "SSLCOMMERZ_FAIL_URL",
  "SSLCOMMERZ_CANCEL_URL",
  "SSLCOMMERZ_IPN_URL",
  "BKASH_APP_KEY",
  "BKASH_APP_SECRET",
  "BKASH_USERNAME",
  "BKASH_PASSWORD",
  "NAGAD_MERCHANT_ID",
  "NAGAD_MERCHANT_PRIVATE_KEY",
  "NAGAD_MERCHANT_PUBLIC_KEY",
  "PATHAO_CLIENT_ID",
  "PATHAO_CLIENT_SECRET",
  "PATHAO_USERNAME",
  "PATHAO_PASSWORD",
  "PATHAO_STORE_ID",
  "STEADFAST_API_KEY",
  "STEADFAST_API_SECRET",
  "REDX_API_KEY",
  "FACEBOOK_PIXEL_ID",
  "FACEBOOK_CONVERSIONS_API_TOKEN"
];

const placeholderPatterns = [
  /your_/i,
  /changeme/i,
  /change_this/i,
  /change-me/i,
  /example/i,
  /test_/i,
  /dummy/i,
  /sandbox/i,
  /localhost/i
];

const missing = [];
const unsafe = [];

for (const key of requiredVars) {
  const value = env[key];
  if (!value) {
    missing.push(key);
    continue;
  }

  if (placeholderPatterns.some((pattern) => pattern.test(value))) {
    unsafe.push(`${key}=${value}`);
  }
}

if (env.NODE_ENV !== "production") {
  unsafe.push(`NODE_ENV=${env.NODE_ENV ?? "<missing>"}`);
}

const urlChecks = [
  "NEXTAUTH_URL",
  "AWS_CLOUDFRONT_URL",
  "FRONTEND_URL",
  "PAYMENT_SERVICE_URL",
  "SSLCOMMERZ_SUCCESS_URL",
  "SSLCOMMERZ_FAIL_URL",
  "SSLCOMMERZ_CANCEL_URL",
  "SSLCOMMERZ_IPN_URL"
];

for (const key of urlChecks) {
  const value = env[key];
  if (value && !value.startsWith("https://")) {
    unsafe.push(`${key} must use https in production`);
  }
}

if ((env.CORS_ORIGIN ?? "").includes("*")) {
  unsafe.push("CORS_ORIGIN must not include '*' in production");
}

if ((env.ALLOWED_ORIGINS ?? "").includes("localhost")) {
  unsafe.push("ALLOWED_ORIGINS must not include localhost in production");
}

if ((env.NEXTAUTH_SECRET ?? "").length < 32) {
  unsafe.push("NEXTAUTH_SECRET must be at least 32 characters");
}

if ((env.INTERNAL_API_SECRET ?? "").length < 32) {
  unsafe.push("INTERNAL_API_SECRET must be at least 32 characters");
}

if ((env.JWT_ACCESS_SECRET ?? "").length < 32) {
  unsafe.push("JWT_ACCESS_SECRET must be at least 32 characters");
}

if ((env.JWT_REFRESH_SECRET ?? "").length < 32) {
  unsafe.push("JWT_REFRESH_SECRET must be at least 32 characters");
}

if (missing.length || unsafe.length) {
  console.error("Production environment validation failed.");

  if (missing.length) {
    console.error("\nMissing variables:");
    for (const key of missing) {
      console.error(`- ${key}`);
    }
  }

  if (unsafe.length) {
    console.error("\nUnsafe or placeholder values:");
    for (const message of unsafe) {
      console.error(`- ${message}`);
    }
  }

  process.exit(1);
}

console.log("Production environment validation passed.");
