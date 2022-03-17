import { IMiddleWare } from '@ncf/engine';

export interface LatencyConfig {
  /** 最大延迟的毫秒数 */  maxLatencyMs: number,
}

const defaultConfig: LatencyConfig = {
  maxLatencyMs: 3000,
}

/** 延迟开始执行不超过任意毫秒数  */
export const randomLatency: IMiddleWare<LatencyConfig> = async (ctx, config = defaultConfig, next) => {
  await new Promise(r => setTimeout(r, Math.random() * (config.maxLatencyMs || 100)));
  await next();
}

randomLatency.configKey = Symbol('randomLatency');;

export function setRandomLatencyConfig(cfg: LatencyConfig) {
  return {
    [randomLatency.configKey!]: cfg
  }
}
