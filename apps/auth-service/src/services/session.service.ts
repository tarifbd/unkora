import { prisma } from "@unkora/database";
import { redis, REDIS_KEYS } from "@unkora/database";

export const sessionService = {
  async invalidateSession(userId: string, sessionId: string): Promise<void> {
    await prisma.userSession.deleteMany({ where: { id: sessionId, user_id: userId } });
    await redis.del(REDIS_KEYS.refreshToken(userId, sessionId));
  },

  async invalidateAllSessions(userId: string): Promise<void> {
    const sessions = await prisma.userSession.findMany({
      where: { user_id: userId },
      select: { id: true },
    });
    await prisma.userSession.deleteMany({ where: { user_id: userId } });
    for (const session of sessions) {
      await redis.del(REDIS_KEYS.refreshToken(userId, session.id));
    }
  },
};
