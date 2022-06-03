import { type IMiddleWare } from '@ncf/microkernel';

/** 高阶中间件，可以控制被包含的中间件是否执行 */
export function wrapper(mw: IMiddleWare): IMiddleWare {
  return async function (ctx, next) {
    if (ctx.path.startsWith('/basic')) {
      await mw(ctx, next);
    } else {
      await next();
    }
  }
}
