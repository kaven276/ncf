import redis from 'src/baas/ioredis/redisdb1.baas';
import { mwCache, RedisCache } from 'src/mw/cache';

export function createCacheMiddleware() {
  return new RedisCache(redis);
}
