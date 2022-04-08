
import { IFaasModule } from './faas';
import type { GwExtras } from './gateway';

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
  /** 代理的路径 */
  proxiedPath?: string,
  /** 请求 */
  request: any,
  /** 响应 */
  response: any,
  /** faas 服务模块 */
  fassModule: IFaasModule,
  /** 跟踪发生的带提交或回滚的事务清单 */
  readonly trans: TransactionDealer[],
  gw: GwExtras,
};
