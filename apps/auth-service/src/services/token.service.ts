import jwt from "jsonwebtoken";
import crypto from "crypto";
import { redis, REDIS_KEYS } from "@unkora/database";
import { createLogger } from "@unkora/utils";

const logger = createLogger("token-service");

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_SECS = 60 * 60 * 24 * 30; // 30 days

export interface TokenPayload {
  sub: string;       // userId
  role: string;
  sessionId: string;
  jti: string;
}

export function generateAccessToken(payload: Omit<TokenPayload, "jti">): string {
  const secret = process.env["JWT_ACCESS_SECRET"];
  if (!secret) throw new Error("JWT_ACCESS_SECRET not set");
  const jti = crypto.randomUUID();
  return jwt.sign({ ...payload, jti }, secret, { expiresIn: ACCESS_TOKEN_TTL });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export async function storeRefreshToken(
  userId: string,
  sessionId: string,
  refreshToken: string,
  deviceInfo: { ip: string; userAgent: string }
): Promise<void> {
  const key = REDIS_KEYS.refreshToken(userId, sessionId);
  const data = {
    token: crypto.createHash("sha256").update(refreshToken).digest("hex"),
    userId,
    sessionId,
    ...deviceInfo,
    createdAt: Date.now(),
  };
  await redis.setJson(key, data, REFRESH_TOKEN_TTL_SECS);
}

export async function verifyRefreshToken(
  userId: string,
  sessionId: string,
  refreshToken: string
): Promise<boolean> {
  const key = REDIS_KEYS.refreshToken(userId, sessionId);
  const stored = await redis.getJson<{ token: string }>(key);
  if (!stored) return false;
  const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(stored.token), Buffer.from(hash));
}

export async function revokeRefreshToken(userId: string, sessionId: string): Promise<void> {
  const key = REDIS_KEYS.refreshToken(userId, sessionId);
  await redis.del(key);
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  const pattern = `refresh:${userId}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    // Strip prefix added by ioredis
    const rawKeys = keys.map(k => k.replace("unkora:", ""));
    await redis.del(...rawKeys);
  }
}

export function verifyAccessToken(token: string): TokenPayload {
  const secret = process.env["JWT_ACCESS_SECRET"];
  if (!secret) throw new Error("JWT_ACCESS_SECRET not set");
  return jwt.verify(token, secret) as TokenPayload;
}

export async function blacklistToken(jti: string, expiresInSecs: number): Promise<void> {
  await redis.setex(REDIS_KEYS.tokenBlacklist(jti), expiresInSecs, "1");
}

export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  const result = await redis.get(REDIS_KEYS.tokenBlacklist(jti));
  return result !== null;
}

logger.info("Token service initialized");
