import { setRandomLatencyConfig } from 'src/mw/randomLatency';
import { setMaxConcurrencyConfig } from 'src/cfg/cfg-max-concurrency';

export const config = {
  ...setRandomLatencyConfig({
    maxLatencyMs: 20 * 1000,
  }),
  ...setMaxConcurrencyConfig({
    maxConcurrency: 3,
  }),
}

/** 测试中间件目录配置也可以直接配置到单个 faas 服务生效 */
export const faas = async () => {
  return 'ok';
}
