import { MWContext } from '@ncf/engine';

export async function logTimeUse(ctx: MWContext, next: () => Promise<void>) {
  const startTime = Date.now();
  await next();
  const timeUsed = Date.now() - startTime;
  console.log(`call ${ctx.path} use ${timeUsed}ms`);
}
