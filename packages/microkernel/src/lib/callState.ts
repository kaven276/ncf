import { AsyncLocalStorage } from 'node:async_hooks';
import { IFaasModule, Service, IApi } from './faas';
import type { GwExtras } from './gateway';
import type { Caller } from './caller';

export interface TransactionDealer {
  /** 提交 */
  commit: () => void;
  /** 回滚 */
  rollback: () => void;
}

interface LaterFaasCall<T extends IApi = IApi> {
  faas: Service<T>
  request: any,
  delay?: number,
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
  /** 调用者身份信息 */
  caller: Caller,
  /** faas 服务模块 */
  fassModule: IFaasModule,
  /** 跟踪发生的带提交或回滚的事务清单 */
  readonly trans: TransactionDealer[],
  /** 跟踪参与事务的弱 faas call */
  laterFaasCalls: LaterFaasCall[],
  gw: GwExtras,
};

/** 调用上下文对象 */
export const asyncLocalStorage = new AsyncLocalStorage<ICallState>();

/** 获取当前调用期间的调用上下文状态 */
export function getCallState(): ICallState {
  return asyncLocalStorage.getStore()!;
}

/** 创建调用上下文上的项目，用于中间件和 faas 的信息传递 */
export function createCtxItem<T>(key: Symbol) {
  return {
    set(v: T) {
      const als = getCallState();
      //@ts-ignore
      als[key] = v;
    },
    get(): T | undefined {
      //@ts-ignore
      return getCallState()[key];
    }
  }
}
