import { getDebug, IMiddleWare } from '@ncf/engine';

const debug = getDebug(module);
export const logTimeUse: IMiddleWare = async (ctx, next) => {
  const startTime = Date.now();
  await next();
  const timeUsed = Date.now() - startTime;
  debug(`call ${ctx.path} use ${timeUsed}ms`);
}
