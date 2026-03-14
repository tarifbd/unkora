import Redis from "ioredis";

const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";
const KEY_PREFIX = "unkora:";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (redisClient) return redisClient;

  redisClient = new Redis(REDIS_URL, {
    keyPrefix: KEY_PREFIX,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      console.warn(`⚠️  Redis retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = "READONLY";
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  });

  redisClient.on("connect", () => console.log("✅ Redis connected"));
  redisClient.on("error", (err) => console.error("❌ Redis error:", err));
  redisClient.on("close", () => console.warn("⚠️  Redis connection closed"));

  return redisClient;
}

// ── HELPER METHODS ───────────────────────────

export const redis = {
  async get(key: string): Promise<string | null> {
    return getRedisClient().get(key);
  },

  async set(key: string, value: string): Promise<"OK"> {
    return getRedisClient().set(key, value);
  },

  async setex(key: string, seconds: number, value: string): Promise<"OK"> {
    return getRedisClient().setex(key, seconds, value);
  },

  async del(...keys: string[]): Promise<number> {
    return getRedisClient().del(...keys);
  },

  async exists(...keys: string[]): Promise<number> {
    return getRedisClient().exists(...keys);
  },

  async hget(key: string, field: string): Promise<string | null> {
    return getRedisClient().hget(key, field);
  },

  async hset(key: string, field: string, value: string): Promise<number> {
    return getRedisClient().hset(key, field, value);
  },

  async hgetall(key: string): Promise<Record<string, string>> {
    return getRedisClient().hgetall(key);
  },

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return getRedisClient().hdel(key, ...fields);
  },

  async lpush(key: string, ...values: string[]): Promise<number> {
    return getRedisClient().lpush(key, ...values);
  },

  async rpop(key: string): Promise<string | null> {
    return getRedisClient().rpop(key);
  },

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return getRedisClient().lrange(key, start, stop);
  },

  async zadd(key: string, score: number, member: string): Promise<number | null> {
    return getRedisClient().zadd(key, score, member);
  },

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return getRedisClient().zrange(key, start, stop);
  },

  async zrangebyscore(
    key: string,
    min: number | string,
    max: number | string
  ): Promise<string[]> {
    return getRedisClient().zrangebyscore(key, min, max);
  },

  async zrem(key: string, ...members: string[]): Promise<number> {
    return getRedisClient().zrem(key, ...members);
  },

  async incr(key: string): Promise<number> {
    return getRedisClient().incr(key);
  },

  async decr(key: string): Promise<number> {
    return getRedisClient().decr(key);
  },

  async incrby(key: string, increment: number): Promise<number> {
    return getRedisClient().incrby(key, increment);
  },

  async expire(key: string, seconds: number): Promise<number> {
    return getRedisClient().expire(key, seconds);
  },

  async ttl(key: string): Promise<number> {
    return getRedisClient().ttl(key);
  },

  async keys(pattern: string): Promise<string[]> {
    return getRedisClient().keys(pattern);
  },

  async flushPrefix(prefix: string): Promise<void> {
    const client = getRedisClient();
    const keys = await client.keys(`${prefix}*`);
    if (keys.length > 0) {
      // Remove the global prefix since ioredis adds it automatically
      const rawKeys = keys.map((k) => k.replace(KEY_PREFIX, ""));
      await client.del(...rawKeys);
    }
  },

  // JSON helpers
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.setex(key, ttlSeconds, serialized);
    } else {
      await this.set(key, serialized);
    }
  },

  // Pub/Sub
  publish(channel: string, message: string): Promise<number> {
    return getRedisClient().publish(channel, message);
  },

  getSubscriber(): Redis {
    return new Redis(REDIS_URL);
  },

  getPublisher(): Redis {
    return new Redis(REDIS_URL);
  },
};

// ── REDIS KEY PATTERNS ───────────────────────
export const REDIS_KEYS = {
  session: (sessionId: string) => `session:${sessionId}`,                    // TTL: 7d
  cart: (userId: string) => `cart:${userId}`,                                // TTL: 30d
  product: (productId: string) => `product:${productId}`,                    // TTL: 1h
  categoryTree: () => `category:tree`,                                        // TTL: 6h
  rateLimit: (ip: string, endpoint: string) => `rate:${ip}:${endpoint}`,    // TTL: 1m
  flashSaleStock: (saleId: string, productId: string) =>
    `flashsale:${saleId}:${productId}`,
  otp: (identifier: string) => `otp:${identifier}`,                          // TTL: 5m
  otpAttempts: (identifier: string) => `otp_attempts:${identifier}`,        // TTL: 15m
  tokenBlacklist: (jti: string) => `blacklist:${jti}`,
  searchSuggest: (prefix: string) => `search:suggest:${prefix}`,            // TTL: 24h
  stockReserve: (orderId: string, productId: string) =>
    `stock:reserve:${orderId}:${productId}`,                                 // TTL: 15m
  refreshToken: (userId: string, sessionId: string) =>
    `refresh:${userId}:${sessionId}`,                                         // TTL: 30d
  bkashToken: () => `bkash:token`,                                            // TTL: from API
  recentlyViewed: (userId: string) => `recently_viewed:${userId}`,          // TTL: 30d
};

export default redis;
