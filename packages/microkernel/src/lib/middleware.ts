/* 这里面定义 middleware 的规范 */

import { ICallState } from './callState';

/** middleware 函数规范 */
export interface IMiddleWare {
  (
    /** 调用环境信息，包括请求，效应，异步调用链状态等 */
    ctx: ICallState,
    /** 下一步，下一个中间件或者目标服务函数执行 */
    next: () => Promise<void>
  ): Promise<void>,
}

/** 支持 middleware 的类的标准，用于可配置可修改配置的中间件 */
export abstract class MiddleWareClass {
  middleware: IMiddleWare;
}
