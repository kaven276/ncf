import { IncomingMessage } from 'http';

export interface IApi {
  path: string,
  request?: any,
  response: any,
}

/** 实现特定 API 规范的服务函数的 TS 函数类型 */
export interface Service<T extends IApi> {
  (request: T["request"], stream?: IncomingMessage): Promise<T["response"]>,
  faasPath?: string,
}

export interface IFaasModule<T extends IApi = IApi> {
  fake: boolean,
  faas: Service<T>,
}
