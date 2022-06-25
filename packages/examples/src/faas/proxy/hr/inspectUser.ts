import { cfgLatency } from 'src/mw/randomLatency';

/** 中间件配置对走代理的特定API起到作用 */
export const config = {
  ...cfgLatency.set({maxLatencyMs: 3000}),
}
