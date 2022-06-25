// 外部服务中特定的服务本地直接在 faas 实现，不再走代理模式，示范老代码迁移到 NCF

import { cfgLatency } from 'src/mw/randomLatency';

// 测试中间件配置是否生效
export const config = {
  ...cfgLatency.set({maxLatencyMs: 1000}),
}

export const faas = async () => {
  return '直接实现API，不再代理' + Math.random();
}
