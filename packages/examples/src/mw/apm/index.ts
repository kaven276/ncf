import { getDebug, IMiddleWare, throwServiceError, AutoCreateItemMap } from '@ncf/microkernel';
import { cfgMaxConcurrency } from 'src/cfg/cfg-max-concurrency';
import { Stat } from './Stat';

const debug = getDebug(module);

export const statMap = new AutoCreateItemMap<Stat>();

/** 采集服务调用性能数据的中间件 */
export const collectTimes: IMiddleWare = async (ctx, next) => {
  const startTime = Date.now();
  const stat = statMap.getOrCreate(ctx.path, () => new Stat(ctx.path, startTime));
  const { maxConcurrency } = cfgMaxConcurrency.get(ctx);
  if (stat.concurrency >= maxConcurrency) {
    throwServiceError(400, `在途并行量超过设定的 ${maxConcurrency} 个！禁止继续执行`);
  }
  stat.onBefore();
  debug('collectTimes', stat);
  await next();
  stat.onAfter(startTime);
}

/** 给出 top10，以 totalExecTime 大到小排序 */
export function getTop10(): Stat[] {
  return [...statMap.values()].sort((a, b) => (b.totalExecTime - a.totalExecTime)).slice(0, 10);
}

