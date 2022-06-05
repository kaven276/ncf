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
  faasPath?: string,
}

export interface IFaasModule<T extends IApi = IApi> {
  fake: boolean,
  faas: Service<T>,
}
