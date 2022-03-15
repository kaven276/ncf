import { ICallState, getDebug } from '@ncf/engine';

const debug = getDebug(module);
export async function logTimeUse(ctx: ICallState, cfg: any, next: () => Promise<void>) {
  const startTime = Date.now();
  await next();
  const timeUsed = Date.now() - startTime;
  debug(`call ${ctx.path} use ${timeUsed}ms`);
}
