import type { UserRole } from "@unkora/types";
import type { Request } from "express";

export interface JwtPayload {
  sub: string;       // user id
  role: UserRole;
  jti: string;       // unique token id
  sessionId: string;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    sessionId: string;
    jti: string;
  };
}

export interface RegisterPhoneInput {
  phone: string;
}

export interface VerifyPhoneOtpInput {
  phone: string;
  otp: string;
  name_en: string;
  name_bn?: string;
  email?: string;
  password?: string;
  referral_code?: string;
}

export interface LoginPhoneInput {
  phone: string;
}

export interface VerifyLoginOtpInput {
  phone: string;
  otp: string;
  device_fingerprint: string;
  device_name?: string;
}

export interface LoginEmailInput {
  email: string;
  password: string;
  device_fingerprint: string;
  device_name?: string;
}

export interface LoginSocialInput {
  provider: "google" | "facebook";
  token: string;
  device_fingerprint: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface SessionInfo {
  id: string;
  device_name: string | null;
  device_fingerprint: string;
  ip_address: string;
  user_agent: string;
  is_trusted: boolean;
  last_active: Date;
  expires_at: Date;
  created_at: Date;
  is_current?: boolean;
}
