import { IMiddleWare, getConfig } from '@ncf/engine';

export interface LatencyConfig {
  /** 最大延迟的毫秒数 */  maxLatencyMs: number,
}

const configKey = Symbol('randomLatency');

const defaultConfig: LatencyConfig = {
  maxLatencyMs: 3000,
}

/** 延迟开始执行不超过任意毫秒数  */
export const randomLatency: IMiddleWare = async (ctx, next) => {
  const config: LatencyConfig = getConfig(configKey, ctx) || defaultConfig;
  await new Promise(r => setTimeout(r, Math.random() * (config.maxLatencyMs || 100)));
  await next();
}

export function setRandomLatencyConfig(cfg: LatencyConfig) {
  return {
    [configKey!]: cfg
  }
}
