import { setTimeout } from 'node:timers/promises';
import { cfgCache, cfgCacheKeyFn } from 'src/mw/cache';

// 对于一个执行耗时的服务，推荐配置缓存策略，降低服务端压力
export const config = {
  ...cfgCache.set({
    /** 缓存有效期 10s */
    maxAge: 10 * 1000,
  }),
  ...cfgCacheKeyFn.set(() => 'fixed')
}

/** 测试一个长任务是否可以 survive SIGHUP，gracefule quit */
export const faas = async () => {
  await setTimeout(10 * 1000);
  return 'sorry let you wait too long';
}
