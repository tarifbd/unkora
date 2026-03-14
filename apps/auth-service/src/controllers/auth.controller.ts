import type { Request, Response, NextFunction } from "express";
import { asyncHandler, HttpError } from "@unkora/utils";
import * as authService from "../services/auth.service";
import { prisma } from "@unkora/database";

// ── REGISTRATION ─────────────────────────────

export const registerPhone = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body as { phone: string };
  if (!phone) throw HttpError.BadRequest("Phone is required");
  const result = await authService.registerWithPhone(phone);
  res.json({ success: true, ...result });
});

export const verifyPhoneRegistration = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp, name_en, email } = req.body as {
    phone: string; otp: string; name_en: string; email?: string;
  };
  if (!phone || !otp || !name_en) throw HttpError.BadRequest("phone, otp, name_en required");
  const tokens = await authService.verifyPhoneRegistration(phone, otp, name_en, email);
  res.status(201).json({ success: true, data: tokens });
});

export const registerEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name_en } = req.body as {
    email: string; password: string; name_en: string;
  };
  if (!email || !password || !name_en) throw HttpError.BadRequest("email, password, name_en required");
  const result = await authService.registerWithEmail(email, password, name_en);
  res.status(201).json({ success: true, data: result });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params as { token: string };
  await authService.verifyEmailToken(token);
  res.json({ success: true, message: "Email verified successfully" });
});

// ── LOGIN ─────────────────────────────────────

export const loginPhone = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body as { phone: string };
  const result = await authService.loginWithPhone(phone);
  res.json({ success: true, ...result });
});

export const verifyPhoneLogin = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp } = req.body as { phone: string; otp: string };
  const deviceInfo = {
    ip: String(req.ip ?? ""),
    userAgent: req.headers["user-agent"] ?? "",
  };
  const tokens = await authService.verifyPhoneLogin(phone, otp, deviceInfo);
  res.json({ success: true, data: tokens });
});

export const loginEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const deviceInfo = { ip: String(req.ip ?? ""), userAgent: req.headers["user-agent"] ?? "" };
  const tokens = await authService.loginWithEmail(email, password, deviceInfo);
  res.json({ success: true, data: tokens });
});

export const loginSocial = asyncHandler(async (req: Request, res: Response) => {
  const { provider, token: socialToken } = req.body as { provider: "google" | "facebook"; token: string };
  const deviceInfo = { ip: String(req.ip ?? ""), userAgent: req.headers["user-agent"] ?? "" };
  const tokens = await authService.loginWithSocial(provider, socialToken, deviceInfo);
  res.json({ success: true, data: tokens });
});

// ── TOKEN MANAGEMENT ──────────────────────────

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { userId, sessionId, refreshToken: rt } = req.body as {
    userId: string; sessionId: string; refreshToken: string;
  };
  const deviceInfo = { ip: String(req.ip ?? ""), userAgent: req.headers["user-agent"] ?? "" };
  const tokens = await authService.refreshTokens(userId, sessionId, rt, deviceInfo);
  res.json({ success: true, data: tokens });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!.id, req.user!.sessionId);
  res.json({ success: true, message: "Logged out" });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAll(req.user!.id);
  res.json({ success: true, message: "Logged out from all devices" });
});

// ── PASSWORD ──────────────────────────────────

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  await authService.requestPasswordReset(email);
  res.json({ success: true, message: "Reset link sent if email exists" });
});

export const confirmPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as { token: string; newPassword: string };
  await authService.confirmPasswordReset(token, newPassword);
  res.json({ success: true, message: "Password reset successfully" });
});

// ── PIN ───────────────────────────────────────

export const setupPIN = asyncHandler(async (req: Request, res: Response) => {
  const { pin } = req.body as { pin: string };
  await authService.setupPIN(req.user!.id, pin);
  res.json({ success: true, message: "PIN set successfully" });
});

export const pinLogin = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, pin } = req.body as { identifier: string; pin: string };
  const deviceInfo = { ip: String(req.ip ?? ""), userAgent: req.headers["user-agent"] ?? "" };
  const tokens = await authService.loginWithPIN(identifier, pin, deviceInfo);
  res.json({ success: true, data: tokens });
});

// ── SESSIONS ──────────────────────────────────

export const getSessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await prisma.userSession.findMany({
    where: { user_id: req.user!.id, expires_at: { gt: new Date() } },
    orderBy: { last_active: "desc" },
  });
  res.json({ success: true, data: sessions });
});

export const revokeSession = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params as { sessionId: string };
  await authService.logout(req.user!.id, sessionId);
  res.json({ success: true, message: "Session revoked" });
});

// ── 2FA ───────────────────────────────────────

export const setup2FA = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.setup2FA(req.user!.id);
  res.json({ success: true, data: result });
});

export const verify2FA = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body as { code: string };
  await authService.enable2FA(req.user!.id, code);
  res.json({ success: true, message: "2FA enabled" });
});

export const disable2FA = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body as { code: string };
  await authService.disable2FA(req.user!.id, code);
  res.json({ success: true, message: "2FA disabled" });
});

// ── PROFILE ───────────────────────────────────

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true, email: true, phone: true, name_en: true, name_bn: true,
      avatar: true, role: true, status: true, email_verified: true,
      phone_verified: true, two_factor_enabled: true, loyalty_points: true,
      loyalty_tier: true, referral_code: true, last_login_at: true, created_at: true,
    },
  });
  if (!user) throw HttpError.NotFound("User not found");
  res.json({ success: true, data: user });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name_en, name_bn, avatar } = req.body as {
    name_en?: string; name_bn?: string; avatar?: string;
  };
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name_en, name_bn, avatar },
    select: { id: true, name_en: true, name_bn: true, avatar: true, updated_at: true },
  });
  res.json({ success: true, data: user });
});
