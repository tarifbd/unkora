import jwt from "jsonwebtoken";
import { HttpError } from "@unkora/utils";
import type { UserRole } from "@unkora/types";

const ACCESS_SECRET = process.env["JWT_ACCESS_SECRET"] ?? "dev-access-secret-change-in-prod";

export interface TokenPayload { userId: string; role: UserRole; sessionId: string; }

export class TokenService {
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
    } catch {
      throw HttpError.Unauthorized("Invalid token", "INVALID_TOKEN");
    }
  }
}
