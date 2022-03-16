import { IMiddleWare, IConfig } from '@ncf/engine';

interface LatencyConfig {
  /** 最大延迟的毫秒数 */
  maxLatencyMs: number,
}

const defaultConfig: LatencyConfig = {
  maxLatencyMs: 3000,
}

declare module '@ncf/engine' {
  interface IConfig {
    /** 默认延迟执行中间件的配置 */
    randomLatency: LatencyConfig
  }
}

/** 延迟开始执行不超过任意毫秒数  */
export const randomLatency: IMiddleWare = async (ctx, config: IConfig, next) => {
  const myConfig: IConfig["randomLatency"] = config.randomLatency || defaultConfig;
  await new Promise(r => setTimeout(r, Math.random() * (myConfig.maxLatencyMs || 100)));
  await next();
}
