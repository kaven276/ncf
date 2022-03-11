import { MWContext } from '@ncf/engine';

interface IConfig {
  maxLatencyMs?: number,
}
export function createRandomLatency(cfg: IConfig = {}) {
  /** 延迟开始执行不超过任意毫秒数 */
  return async function randomLatency(ctx: MWContext, next: () => Promise<void>) {
    await new Promise(r => setTimeout(r, Math.random() * (cfg.maxLatencyMs || 3000)));
    return next();
  }
}
