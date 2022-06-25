// 没有实现 faas，但是配置了中间件
// 最终找到的是 /faas/typeorm/hr/findUsers.ts 中的服务

import { faas as proxy } from '..';
import { faas as target } from 'src/faas/typeorm/hr/findUsers';
import { cfgLatency } from 'src/mw/randomLatency';

/** 中间件配置对走代理的特定API起到作用 */
export const config = {
  ...cfgLatency.set({maxLatencyMs: 2000}),
}

/** faas 服务带 ts 规范，方便测试用例编写 */
export const faas: typeof target = proxy as any;

// 针对 tsx 自动多请求测试配置范例
faas.tests = {
  test1: {
    sex: 'male',
  },
  test2: {
    showNames: true,
  }
}
