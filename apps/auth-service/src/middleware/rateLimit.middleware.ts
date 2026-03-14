import { Request, Response, NextFunction } from "express";
import { redis } from "@unkora/database";
import { HttpError } from "@unkora/utils";

export function rateLimitMiddleware(key: string, maxRequests: number, windowSeconds: number) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "unknown";
    const redisKey = `rate:${ip}:${key}`;
    try {
      const current = await redis.incr(redisKey);
      if (current === 1) await redis.expire(redisKey, windowSeconds);
      if (current > maxRequests) {
        next(HttpError.TooManyRequests(`Too many requests. Max ${maxRequests} per ${windowSeconds}s`, "RATE_LIMITED", "অনেকবার চেষ্টা করা হয়েছে"));
        return;
      }
      next();
    } catch { next(); }
  };
}
