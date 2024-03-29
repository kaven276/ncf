import { IMiddleWare, createCfgItem, getDebug } from '@ncf/microkernel';
export { RedisCache } from './redisCache';

const debug = getDebug(module);

export interface CacheConfig {
  /** 缓存最大有效的毫秒数 */
  maxAge: number,
}

export const cfgCache = createCfgItem<CacheConfig>(Symbol('Cache'), {
  /** 默认1分钟缓存有效期 */
  maxAge: 60 * 1000,
});

export interface CacheKeyFn {
  /** 缓存最大有效的毫秒数 */
  (req: any): string;
}

/** 配置如何确定缓存 key，无默认值 */
export const cfgCacheKeyFn = createCfgItem<CacheKeyFn>(Symbol('CacheKeyFn'));

export interface CachedItem {
  content: any,
  createdAt: number,
  hitCount: number,
}
type OneFaasCache = Map<string, CachedItem>;
const cacheStore = new Map<string, OneFaasCache>();

/** 延迟开始执行不超过任意毫秒数  */
export const mwCache: IMiddleWare = async (ctx, next) => {
  const config: CacheConfig = cfgCache.get(ctx);
  const getCacheKey = cfgCacheKeyFn.get1(ctx);
  if (getCacheKey) {
    const cacheKey = getCacheKey(ctx.request);
    if (cacheKey === undefined) {
      await next();
    } else {
      let faasCache: OneFaasCache | undefined = cacheStore.get(ctx.path);
      if (!faasCache) {
        faasCache = new Map();
        cacheStore.set(ctx.path, faasCache);
      }
      let cached = faasCache.get(cacheKey);
      if (cached) {
        if (Date.now() - cached.createdAt < config.maxAge) {
          cached.hitCount += 1;
          ctx.response = cached.content;
          debug(`${ctx.path}, ${cacheKey} cache hit ${cached.hitCount} times`);
          return;
        } else {
          debug(`${ctx.path}, ${cacheKey} cache over maxAge`);
        }
      } else {
        debug(`${ctx.path}, ${cacheKey} cache miss`);
      }
      await next();
      cached = {
        content: ctx.response,
        createdAt: Date.now(),
        hitCount: cached ? cached.hitCount : 0,
      };
      debug(`${ctx.path}, ${cacheKey} cache save`);
      faasCache.set(cacheKey, JSON.parse(JSON.stringify(cached)));
    }
  } else {
    await next();
  }
}
