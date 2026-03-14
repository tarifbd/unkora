import argon2 from "argon2";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "@unkora/database";
import { createLogger, generateReferralCode, HttpError } from "@unkora/utils";
import { sendOTP, verifyOTPCode } from "./otp.service";
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from "./token.service";
import { UserRole } from "@unkora/types";

const logger = createLogger("auth-service");

// Argon2id config (OWASP recommended)
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  timeCost: 3,
  memoryCost: 65536, // 64MB
  parallelism: 4,
};

export async function registerWithPhone(phone: string): Promise<{ message: string }> {
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    throw HttpError.Conflict("Phone already registered", "PHONE_EXISTS", "এই ফোন নম্বর ইতিমধ্যে নিবন্ধিত");
  }
  await sendOTP(phone);
  return { message: "OTP sent to your phone" };
}

export async function verifyPhoneRegistration(
  phone: string,
  otp: string,
  name_en: string,
  email?: string
) {
  const { valid, error } = await verifyOTPCode(phone, otp);
  if (!valid) throw HttpError.BadRequest(error ?? "Invalid OTP", "INVALID_OTP", "ভুল OTP");

  const referral_code = generateReferralCode();
  const user = await prisma.user.create({
    data: {
      phone,
      name_en,
      email: email ?? null,
      phone_verified: true,
      referral_code,
      role: UserRole.CUSTOMER,
    },
  });

  return generateAuthTokens(user.id, user.role, { ip: "unknown", userAgent: "unknown" });
}

export async function loginWithPhone(phone: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw HttpError.NotFound("Phone not registered", "USER_NOT_FOUND");
  if (user.status !== "ACTIVE") throw HttpError.Forbidden("Account suspended", "ACCOUNT_SUSPENDED");
  await sendOTP(phone);
  return { message: "OTP sent" };
}

export async function verifyPhoneLogin(
  phone: string,
  otp: string,
  deviceInfo: { ip: string; userAgent: string }
) {
  const { valid, error } = await verifyOTPCode(phone, otp);
  if (!valid) throw HttpError.BadRequest(error ?? "Invalid OTP", "INVALID_OTP");

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw HttpError.NotFound("User not found", "USER_NOT_FOUND");
  if (user.status !== "ACTIVE") throw HttpError.Forbidden("Account suspended", "ACCOUNT_SUSPENDED");

  await prisma.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } });
  return generateAuthTokens(user.id, user.role, deviceInfo);
}

export async function loginWithEmail(
  email: string,
  password: string,
  deviceInfo: { ip: string; userAgent: string }
) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password_hash) {
    throw HttpError.Unauthorized("Invalid credentials", "INVALID_CREDENTIALS", "ইমেইল বা পাসওয়ার্ড ভুল");
  }
  if (user.status !== "ACTIVE") throw HttpError.Forbidden("Account suspended", "ACCOUNT_SUSPENDED");

  const valid = await argon2.verify(user.password_hash, password);
  if (!valid) throw HttpError.Unauthorized("Invalid credentials", "INVALID_CREDENTIALS");

  await prisma.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } });
  return generateAuthTokens(user.id, user.role, deviceInfo);
}

export async function refreshTokens(
  userId: string,
  sessionId: string,
  refreshToken: string,
  deviceInfo: { ip: string; userAgent: string }
) {
  const valid = await verifyRefreshToken(userId, sessionId, refreshToken);
  if (!valid) throw HttpError.Unauthorized("Invalid refresh token", "INVALID_REFRESH_TOKEN");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "ACTIVE") throw HttpError.Unauthorized("Account inactive", "ACCOUNT_INACTIVE");

  await revokeRefreshToken(userId, sessionId);
  return generateAuthTokens(user.id, user.role, deviceInfo, sessionId);
}

export async function logout(userId: string, sessionId: string): Promise<void> {
  await revokeRefreshToken(userId, sessionId);
  await prisma.userSession.deleteMany({ where: { id: sessionId, user_id: userId } });
}

export async function logoutAll(userId: string): Promise<void> {
  await revokeAllUserTokens(userId);
  await prisma.userSession.deleteMany({ where: { user_id: userId } });
}

export async function setupPIN(userId: string, pin: string): Promise<void> {
  if (!/^\d{4}$/.test(pin)) throw HttpError.BadRequest("PIN must be 4 digits", "INVALID_PIN");
  const allSame = /^(\d)\1{3}$/.test(pin);
  if (allSame) throw HttpError.BadRequest("PIN cannot be all same digits", "WEAK_PIN");

  const hash = await bcrypt.hash(pin, 12);
  await prisma.user.update({ where: { id: userId }, data: { pin_hash: hash } });
}

export async function loginWithPIN(
  identifier: string,
  pin: string,
  deviceInfo: { ip: string; userAgent: string }
) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ phone: identifier }, { email: identifier }] },
  });
  if (!user || !user.pin_hash) throw HttpError.Unauthorized("Invalid credentials", "INVALID_CREDENTIALS");
  if (user.status !== "ACTIVE") throw HttpError.Forbidden("Account suspended", "ACCOUNT_SUSPENDED");

  const valid = await bcrypt.compare(pin, user.pin_hash);
  if (!valid) throw HttpError.Unauthorized("Invalid PIN", "INVALID_PIN");

  return generateAuthTokens(user.id, user.role, deviceInfo);
}

// ── HELPERS ───────────────────────────────────

async function generateAuthTokens(
  userId: string,
  role: string,
  deviceInfo: { ip: string; userAgent: string },
  existingSessionId?: string
) {
  const sessionId = existingSessionId ?? crypto.randomUUID();
  const refreshToken = generateRefreshToken();

  await storeRefreshToken(userId, sessionId, refreshToken, deviceInfo);

  // Track session in DB
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.userSession.upsert({
    where: { id: sessionId },
    update: { last_active: new Date(), expires_at: expiresAt, ip_address: deviceInfo.ip },
    create: {
      id: sessionId,
      user_id: userId,
      device_fingerprint: crypto.createHash("sha256").update(deviceInfo.userAgent).digest("hex"),
      ip_address: deviceInfo.ip,
      user_agent: deviceInfo.userAgent,
      expires_at: expiresAt,
    },
  });

  const accessToken = generateAccessToken({ sub: userId, role, sessionId });
  return { accessToken, refreshToken, sessionId };
}

logger.info("Auth service initialized");
