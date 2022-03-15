
import { IncomingMessage, ServerResponse } from 'http';
import { IFaasModule } from './faas';

export interface TransactionDealer {
  /** 提交 */
  commit: () => void;
  /** 回滚 */
  rollback: () => void;
}

/** 服务调用期间的全部内容 */
export interface ICallState {
  /** 调用号 */
  readonly id: number,
  /** 调用服务路径 */
  path: string,
  /** 请求 */
  request: any,
  /** 响应 */
  response: any,
  /** nodejs 原生 http callback 的 req,res */
  readonly http: {
    readonly req: IncomingMessage,
    readonly res: ServerResponse,
  },
  /** faas 服务模块 */
  fassModule: IFaasModule,
  /** 跟踪发生的带提交或回滚的事务清单 */
  readonly trans: TransactionDealer[],
}
