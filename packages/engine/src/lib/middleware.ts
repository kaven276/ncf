/* 这里面定义 middleware 的规范 */

import { ICallState } from './transaction';

/** 中间件能获取到的上下文 */
export interface MWContext {
  /** 调用服务路径 */
  path: string,
  /** 请求 */
  request: any,
  /** 响应 */
  response: any,
  /** 调用链中保持的状态 */
  callState: ICallState,
}


