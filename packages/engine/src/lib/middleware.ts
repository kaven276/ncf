/* 这里面定义 middleware 的规范 */

import { ICallState } from './callState';

/** middleware 函数规范 */
export interface IMiddleWare {
  (
    /** 调用环境信息，包括请求，效应，异步调用链状态等 */
    ctx: ICallState,
    /** 中间件配置 */
    cfg: any,
    /** 下一步，下一个中间件或者目标服务函数执行 */
    next: () => Promise<void>
  ): Promise<void>,
}

// const m1: IMiddleWare = async (ctx, cfg, next) => { }
