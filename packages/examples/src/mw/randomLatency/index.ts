import { IMiddleWare, createCfgItem } from '@ncf/microkernel';

export interface LatencyConfig {
  /** 最大延迟的毫秒数 */
  maxLatencyMs: number,
}

export const cfgLatency = createCfgItem<LatencyConfig>(Symbol('randomLatency'), {
  maxLatencyMs: 3000,
});

/** 延迟开始执行不超过任意毫秒数  */
export const randomLatency: IMiddleWare = async (ctx, next) => {
  const config: LatencyConfig = cfgLatency.get(ctx);
  await new Promise(r => setTimeout(r, Math.random() * (config.maxLatencyMs || 100)));
  await next();
}
