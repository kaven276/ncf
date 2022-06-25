import { cfgLatency } from 'src/mw/randomLatency';

// 无需 faas 定义，完全靠目录 index.ts 中的代理 faas 实现本接口

/** 中间件配置对走代理的特定API起到作用 */
export const config = {
  ...cfgLatency.set({maxLatencyMs: 3000}),
}
