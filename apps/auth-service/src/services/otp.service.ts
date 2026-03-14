import { redis, REDIS_KEYS } from "@unkora/database";
import { generateOTP, hashOTP, verifyOTP, createLogger } from "@unkora/utils";

const logger = createLogger("otp-service");

const OTP_TTL_SECS = 5 * 60;        // 5 minutes
const MAX_ATTEMPTS = 3;
const LOCKOUT_SECS = 15 * 60;       // 15 minutes

export interface OTPSendResult {
  success: boolean;
  lockedUntil?: number;
  ttl?: number;
}

export async function sendOTP(identifier: string): Promise<OTPSendResult> {
  // Check lockout
  const attemptsKey = REDIS_KEYS.otpAttempts(identifier);
  const attemptsRaw = await redis.get(attemptsKey);
  const attempts = attemptsRaw ? parseInt(attemptsRaw, 10) : 0;

  if (attempts >= MAX_ATTEMPTS) {
    const ttl = await redis.ttl(attemptsKey);
    return { success: false, lockedUntil: Date.now() + ttl * 1000 };
  }

  const otp = generateOTP(6);
  const hash = hashOTP(otp);

  await redis.setex(REDIS_KEYS.otp(identifier), OTP_TTL_SECS, hash);

  // In real implementation, send SMS/email here
  // For dev, log OTP
  if (process.env["NODE_ENV"] !== "production") {
    logger.info(`🔑 OTP for ${identifier}: ${otp}`);
  }

  return { success: true, ttl: OTP_TTL_SECS };
}

export async function verifyOTPCode(
  identifier: string,
  code: string
): Promise<{ valid: boolean; error?: string }> {
  const key = REDIS_KEYS.otp(identifier);
  const attemptsKey = REDIS_KEYS.otpAttempts(identifier);

  const storedHash = await redis.get(key);

  if (!storedHash) {
    return { valid: false, error: "OTP expired or not found" };
  }

  const attemptsRaw = await redis.get(attemptsKey);
  const attempts = attemptsRaw ? parseInt(attemptsRaw, 10) : 0;

  if (attempts >= MAX_ATTEMPTS) {
    const ttl = await redis.ttl(attemptsKey);
    return { valid: false, error: `Too many attempts. Try again in ${Math.ceil(ttl / 60)} minutes` };
  }

  if (!verifyOTP(code, storedHash)) {
    const newAttempts = await redis.incr(attemptsKey);
    if (newAttempts === 1) {
      await redis.expire(attemptsKey, LOCKOUT_SECS);
    }
    const remaining = MAX_ATTEMPTS - newAttempts;
    return { valid: false, error: `Invalid OTP. ${remaining} attempts remaining` };
  }

  // Valid — clean up
  await redis.del(key);
  await redis.del(attemptsKey);
  return { valid: true };
}

export async function clearOTP(identifier: string): Promise<void> {
  await redis.del(REDIS_KEYS.otp(identifier));
  await redis.del(REDIS_KEYS.otpAttempts(identifier));
}
