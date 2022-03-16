import { IMiddleWare, IConfig } from '@ncf/engine';

declare module '@ncf/engine' {
  interface IConfig {
    randomLatency?: {
      /** 最大延迟的毫秒数 */
      maxLatencyMs: number,
    },
  }
}
type MyConfig = IConfig["randomLatency"];

const defaultConfig: MyConfig = {
  maxLatencyMs: 3000,
}

/** 延迟开始执行不超过任意毫秒数  */
export const randomLatency: IMiddleWare = async (ctx, config: IConfig, next) => {
  const myConfig: IConfig["randomLatency"] = config.randomLatency || defaultConfig;
  await new Promise(r => setTimeout(r, Math.random() * (myConfig.maxLatencyMs || 100)));
  await next();
}
