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
  /** 如果本没有 faas 模块文件，而是凭空构建的，为了是虚拟存在方便编程 */
  fake?: true,
  /** 是否已经在后处理了，如果没有 ready，且在后处理中，也需要等待 */
  __initPromise?: Promise<any>,
  /** 是否已经完全后处理完毕(绑定 dir config 并且等等所有依赖模块就绪)，就绪状态 */
  __ready?: true,
  /** 实现 faas 服务的异步函数 */
  faas: Service<T>,
}
