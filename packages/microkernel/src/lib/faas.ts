import type { Readable } from 'node:stream';

export type FaasPath = string;

export interface IApi {
  path: FaasPath,
  request?: any,
  response: any,
}

/** 实现特定 API 规范的服务函数的 TS 函数类型 */
export interface Service<T extends IApi = IApi> {
  (request: T["request"], stream?: Readable): Promise<T["response"]>,
  /** faas 的调用路径 */
  faasPath?: string,
  /** 测试集，key/value, value 为请求，_key 代表注释不参与自动测试 */
  tests?: { [key: string]: T["request"] },
}

export interface IFaasModule<T extends IApi = IApi> {
  fake: boolean,
  faas: Service<T>,
}
