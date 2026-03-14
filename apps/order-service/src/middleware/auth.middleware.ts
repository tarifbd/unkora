import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "@unkora/utils";
import type { UserRole } from "@unkora/types";

const ACCESS_SECRET = process.env["JWT_ACCESS_SECRET"] ?? "dev-access-secret-change-in-prod";
interface TokenPayload { userId: string; role: UserRole; sessionId: string; }

declare global { namespace Express { interface Request { user?: { id: string; role: UserRole; sessionId: string; }; } } }

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) { next(HttpError.Unauthorized("No token provided")); return; }
  try {
    const p = jwt.verify(header.slice(7), ACCESS_SECRET) as TokenPayload;
    req.user = { id: p.userId, role: p.role, sessionId: p.sessionId };
    next();
  } catch { next(HttpError.Unauthorized("Invalid token")); }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) { next(HttpError.Forbidden("Insufficient permissions")); return; }
    next();
  };
}
