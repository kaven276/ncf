/* 这里面定义 middleware 的规范 */

import { ICallState } from './callState';

/** middleware 函数规范 */
export interface IMiddleWare<T = any> {
  (
    /** 调用环境信息，包括请求，效应，异步调用链状态等 */
    ctx: ICallState,
    /** 中间件配置 */
    cfg: T,
    /** 下一步，下一个中间件或者目标服务函数执行 */
    next: () => Promise<void>
  ): Promise<void>,
  /** 本中间件在配置容器中的 key，如果该中间件无需配置，则无次项 */
  configKey?: symbol,
}

// const m1: IMiddleWare = async (ctx, cfg, next) => { }
