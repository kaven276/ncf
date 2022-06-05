/* 这里面定义 middleware 的规范 */
import { ICallState } from './callState';
import { MiddlewareFilePath } from '../util/resolve';
import { registerDep } from '../hotUpdate';
import { getDebug } from '../util/debug';

const debug = getDebug(module);

/** middleware 函数规范 */
export interface IMiddleWare {
  (
    /** 调用环境信息，包括请求，效应，异步调用链状态等 */
    ctx: ICallState,
    /** 下一步，下一个中间件或者目标服务函数执行 */
    next: () => Promise<void>
  ): Promise<void>,
}

/** 支持 middleware 的类的标准，用于可配置可修改配置的中间件 */
export abstract class MiddleWareClass {
  middleware: IMiddleWare;
}

/** 项目配置的中间件清单，顺序重要 */
let middlewares: IMiddleWare[] | undefined;
export async function getMiddlewares() {
  const tryPath = MiddlewareFilePath;
  const mm = await import(tryPath);
  await registerDep(tryPath);
  middlewares = mm.middlewares();
}

const getMiddlewaresPromise = getMiddlewares();

export async function runMiddwares(als: ICallState, finalFn: () => Promise<void>) {
  // 最终做成像 koa 式的包洋葱中间件

  if (!middlewares) {
    await getMiddlewaresPromise;
  }

  async function runMiddware(n: number): Promise<void> {
    debug(`executing middleware ${n}`);
    const mw: IMiddleWare = middlewares![n];
    if (!mw) {
      return await finalFn();
    };
    return mw(als, () => runMiddware(n + 1));
  }

  return runMiddware(0);
}
