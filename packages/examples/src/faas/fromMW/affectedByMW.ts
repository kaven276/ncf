import { cfgExtraResp } from 'src/mw/ClassDemo';

export const config = {
  ...cfgExtraResp.set(true),
}

/** 展示中间件影响处理延迟，影响额外的响应内容 */
export const faas = async () => {
  return {
    now: Date.now(),
  }
}
