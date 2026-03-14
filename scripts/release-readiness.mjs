#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const mustExist = [
  ".dockerignore",
  ".env.example",
  "DEPLOYMENT.md",
  "LAUNCH_CHECKLIST.md",
  ".github/workflows/ci.yml",
  "docker-compose.yml",
  "docker-compose.prod.yml"
];

const serviceEntrypoints = [
  "apps/api-gateway/src/index.ts",
  "apps/auth-service/src/index.ts",
  "apps/product-service/src/index.ts",
  "apps/order-service/src/index.ts",
  "apps/payment-service/src/index.ts",
  "apps/notification-service/src/index.ts",
  "apps/search-service/src/index.ts",
  "apps/delivery-service/src/index.ts",
  "apps/marketing-service/src/index.ts"
];

const dockerfiles = [
  "apps/api-gateway/Dockerfile",
  "apps/auth-service/Dockerfile",
  "apps/product-service/Dockerfile",
  "apps/order-service/Dockerfile",
  "apps/payment-service/Dockerfile",
  "apps/notification-service/Dockerfile",
  "apps/search-service/Dockerfile",
  "apps/delivery-service/Dockerfile",
  "apps/marketing-service/Dockerfile",
  "apps/web/Dockerfile",
  "apps/admin/Dockerfile",
  "apps/vendor/Dockerfile"
];

const failures = [];

for (const relativePath of mustExist) {
  if (!fs.existsSync(path.join(rootDir, relativePath))) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

for (const relativePath of serviceEntrypoints) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing service entrypoint: ${relativePath}`);
    continue;
  }

  const source = fs.readFileSync(absolutePath, "utf8");
  if (!source.includes("/health")) {
    failures.push(`Health endpoint not found in ${relativePath}`);
  }
}

for (const relativePath of dockerfiles) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing Dockerfile: ${relativePath}`);
    continue;
  }

  const source = fs.readFileSync(absolutePath, "utf8");
  if (!source.includes(" AS production")) {
    failures.push(`Production stage missing in ${relativePath}`);
  }
  if (!source.includes("USER ")) {
    failures.push(`Non-root user not configured in ${relativePath}`);
  }
}

if (fs.existsSync(path.join(rootDir, "README.md"))) {
  const readme = fs.readFileSync(path.join(rootDir, "README.md"), "utf8");
  for (const linkedFile of ["DEPLOYMENT.md", "LAUNCH_CHECKLIST.md"]) {
    if (!readme.includes(linkedFile)) {
      failures.push(`README.md should reference ${linkedFile}`);
    }
  }
}

if (failures.length) {
  console.error("Release readiness check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Release readiness check passed.");
