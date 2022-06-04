import { cfgCache, cfgCacheKeyFn, CachedItem } from './index';
import { IMiddleWare, MiddleWareClass, createCfgItem, getDebug } from '@ncf/microkernel';
import type { Redis } from 'ioredis';

const debug = getDebug(module);

// 规定外部缓存的接口规范
// 或者直接配置 redis baas 也行

/** 允许应用使用特定的而非默认的类实例，拥有不同的实例配置 */
export class RedisCache implements MiddleWareClass {

  constructor(
    /** 中间件内置配置类型，一个类实例统一配置 */
    public redis: Redis
  ) {
    debug(redis);
  };

  /** 最终挂接到 ncf 的中间件函数 */
  middleware: IMiddleWare = async (ctx, next) => {
    // debug(this.redis);
    const config = cfgCache.get(ctx);
    const getCacheKey = cfgCacheKeyFn.get1(ctx);
    if (getCacheKey) {
      const cacheKey = getCacheKey(ctx.request);
      debug(`cacheKey=${cacheKey}`);
      let hit = false;
      if (cacheKey) {
        //@ts-ignore
        let cached: CachedItem | undefined = await this.redis.hgetall(cacheKey);
        console.log(cacheKey, cached);
        if (cached && cached.content) {
          if (Date.now() - Number(cached.createdAt) < config.maxAge) {
            cached.hitCount = 1 + Number(cached.hitCount);
            await this.redis.hincrby(cacheKey, 'hitCount', 1);
            ctx.response = JSON.parse(cached.content);
            hit = true;
            debug(`${ctx.path}, ${cacheKey} cache hit ${cached.hitCount} times`);
            return;
          } else {
            debug(`${ctx.path}, ${cacheKey} cache over maxAge`);
          }
        } else {
          debug(`${ctx.path}, ${cacheKey} cache miss`);
        }
        if (!hit) {
          await next();
          // 设置到 redis 后每项都变成字符串类型了
          cached = {
            content: JSON.stringify(ctx.response),
            createdAt: Date.now(),
            hitCount: cached ? (cached.hitCount || 0) : 0,
          };
          debug(`${ctx.path}, ${cacheKey} cache save`);
          await this.redis.hmset(cacheKey, cached);
          return;

        }
      }
    }
    await next();
  };
}
