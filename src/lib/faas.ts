export interface IApi {
  path: string,
  request?: any,
  response: any,
}

/** 实现特定 API 规范的服务函数的 TS 函数类型 */
export type Service<T extends { path: string, request?: any, response?: any }> = {
  (request: T["request"]): Promise<T["response"]>
}

export interface IFaasModule {
  faas: Service<any>,
  checkRequest: Function,
  checkResponse: Function,
}
