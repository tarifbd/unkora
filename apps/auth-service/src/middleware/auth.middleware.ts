import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, isTokenBlacklisted } from "../services/token.service";
import { HttpError } from "@unkora/utils";
import { prisma } from "@unkora/database";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        sessionId: string;
        jti: string;
      };
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers["authorization"];
    if (!header?.startsWith("Bearer ")) throw HttpError.Unauthorized("No token provided");

    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    // Check blacklist
    const blacklisted = await isTokenBlacklisted(payload.jti);
    if (blacklisted) throw HttpError.Unauthorized("Token revoked");

    req.user = { id: payload.sub, role: payload.role, sessionId: payload.sessionId, jti: payload.jti };
    next();
  } catch (err) {
    next(err instanceof Error && err.name === "JsonWebTokenError"
      ? HttpError.Unauthorized("Invalid token")
      : err);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(HttpError.Unauthorized("Authentication required"));
    if (!roles.includes(req.user.role)) return next(HttpError.Forbidden("Insufficient permissions"));
    next();
  };
}

export async function requireInternalSecret(req: Request, _res: Response, next: NextFunction) {
  const secret = req.headers["x-internal-secret"];
  if (secret !== process.env["INTERNAL_API_SECRET"]) {
    return next(HttpError.Forbidden("Invalid internal secret"));
  }
  next();
}
