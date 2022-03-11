import { IMiddleWare } from '@ncf/engine';

export interface IRandomLatencyConfig {
  maxLatencyMs?: number,
}

/** 延迟开始执行不超过任意毫秒数  */
export const randomLatency: IMiddleWare = async (ctx, cfg: IRandomLatencyConfig = {}, next) => {
  await new Promise(r => setTimeout(r, Math.random() * (cfg.maxLatencyMs || 3000)));
  return next();
}
