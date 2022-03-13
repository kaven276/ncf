import { AsyncLocalStorage } from 'async_hooks';

export interface TransactionDealer {
  /** 提交 */
  commit: () => void;
  /** 回滚 */
  rollback: () => void;
}

/** 服务调用期间的全部内容 */
export interface ICallState {
  /** 调用号 */
  id: number,
  trans: TransactionDealer[],
  jwtString?: string,
  jwt?: {
    sub: string,
  },
}

export const asyncLocalStorage = new AsyncLocalStorage<ICallState>();

