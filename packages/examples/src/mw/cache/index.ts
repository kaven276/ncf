import { IMiddleWare, getConfig, getDebug } from '@ncf/microkernel';

const debug = getDebug(module);

declare module '@ncf/microkernel' {
  export interface IFaasModule {
    getCacheKey?: {
      (req: any): string | undefined,
    },
  }
}

export interface CacheConfig {
  /** 缓存最大有效的毫秒数 */  maxAge: number,
}

const configKey = Symbol('Cache');

const defaultConfig: CacheConfig = {
  maxAge: 3000,
}

interface CachedItem {
  content: any,
  createdAt: Date,
  hitCount: number,
}
type OneFaasCache = Map<string, CachedItem>;
const cacheStore = new Map<string, OneFaasCache>();

/** 延迟开始执行不超过任意毫秒数  */
export const mwCache: IMiddleWare = async (ctx, next) => {
  const config: CacheConfig = getConfig(configKey, ctx) || defaultConfig;
  if (ctx.fassModule.getCacheKey) {
    const cacheKey = ctx.fassModule.getCacheKey(ctx.request);
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
        cached.hitCount += 1;
        ctx.response = cached.content;
        debug(`${ctx.path}, ${cacheKey} cache hit ${cached.hitCount} times`);
        return;
      } else {
        await next();
        cached = {
          content: ctx.response,
          createdAt: new Date(),
          hitCount: 0,
        };
        faasCache.set(cacheKey, cached);
      }
    }
  } else {
    await next();
  }
}

export function setCacheConfig(cfg: CacheConfig) {
  return {
    [configKey!]: cfg
  }
}
