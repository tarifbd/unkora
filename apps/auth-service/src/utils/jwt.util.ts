import jwt from "jsonwebtoken";
import { generateToken } from "@unkora/utils";
import type { JwtPayload } from "../types/auth.types";
import type { UserRole } from "@unkora/types";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";
const REFRESH_TOKEN_EXPIRY_SECONDS = 30 * 24 * 60 * 60;

function getPrivateKey(): string {
  const key = process.env["JWT_PRIVATE_KEY"];
  if (!key) throw new Error("JWT_PRIVATE_KEY not configured");
  return key.replace(/\\n/g, "\n");
}

function getPublicKey(): string {
  const key = process.env["JWT_PUBLIC_KEY"];
  if (!key) throw new Error("JWT_PUBLIC_KEY not configured");
  return key.replace(/\\n/g, "\n");
}

export function generateAccessToken(
  userId: string,
  role: UserRole,
  sessionId: string
): { token: string; jti: string } {
  const jti = generateToken(16);
  const payload: Omit<JwtPayload, "iat" | "exp"> = {
    sub: userId,
    role,
    jti,
    sessionId,
    type: "access",
  };
  const token = jwt.sign(payload, getPrivateKey(), {
    algorithm: "RS256",
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  return { token, jti };
}

export function generateRefreshToken(
  userId: string,
  role: UserRole,
  sessionId: string
): { token: string; jti: string } {
  const jti = generateToken(16);
  const payload: Omit<JwtPayload, "iat" | "exp"> = {
    sub: userId,
    role,
    jti,
    sessionId,
    type: "refresh",
  };
  const token = jwt.sign(payload, getPrivateKey(), {
    algorithm: "RS256",
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
  return { token, jti };
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getPublicKey(), {
    algorithms: ["RS256"],
  }) as JwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}

export { REFRESH_TOKEN_EXPIRY_SECONDS };
