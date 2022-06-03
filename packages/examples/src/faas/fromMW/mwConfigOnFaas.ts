import { cfgLatency } from 'src/mw/randomLatency';
import { cfgMaxConcurrency } from 'src/cfg/cfg-max-concurrency';

export const config = {
  ...cfgLatency.set({
    maxLatencyMs: 20 * 1000,
  }),
  ...cfgMaxConcurrency.set({
    maxConcurrency: 3,
  }),
}

/** 测试中间件目录配置也可以直接配置到单个 faas 服务生效 */
export const faas = async () => {
  return 'ok1';
}
