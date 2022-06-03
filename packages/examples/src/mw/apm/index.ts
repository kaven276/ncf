import { getDebug, IMiddleWare, throwServiceError } from '@ncf/microkernel';
import { cfgMaxConcurrency } from 'src/cfg/cfg-max-concurrency';

const debug = getDebug(module);

type FaasPath = string;

/** 使用 class 而非 interface 原因是可能因标记统一的类型有利于 v8 优化 */
class Stat {
  constructor(
    public path: FaasPath,
    /** 首次记录时间点, Date.now() */
    public firstExecTime: number,
    /** 执行次数 */
    public times: number = 0,
    /** 最大执行时长, 单位 ms */
    public maxExecTime: number = 0,
    /** 总累计执行时长, 单位 ms */
    public totalExecTime: number = 0,
    /** 当前执行并行量 */
    public concurrency: number = 0,
    /** 最大并行量，这个记录也会被用于控制单个服务的最大并发量，因为该并发量可以对应数据库连接量，防止异常重试导致占用大量数据库连接，影响到其他服务 */
    public hwConcurrency: number = 0,
  ) { }
}
const statMap = new Map<FaasPath, Stat>();

/** 采集服务调用性能数据的中间件 */
export const collectTimes: IMiddleWare = async (ctx, next) => {
  const startTime = Date.now();
  let stat = statMap.get(ctx.path);
  if (!stat) {
    stat = new Stat(ctx.path, startTime);
    statMap.set(stat.path, stat);
  }
  const { maxConcurrency } = cfgMaxConcurrency.get(ctx);
  if (stat.concurrency >= maxConcurrency) {
    throwServiceError(400, `在途并行量超过设定的 ${maxConcurrency} 个！禁止继续执行`);
  }
  stat.concurrency += 1;
  if (stat.concurrency > stat.hwConcurrency) {
    stat.hwConcurrency = stat.concurrency;
  }
  await next();
  stat.concurrency -= 1;
  const timeUsed = Date.now() - startTime;
  if (timeUsed > stat.maxExecTime) {
    stat.maxExecTime = timeUsed;
  }
  stat.times += 1;
  stat.totalExecTime += timeUsed;
}

/** 给出 top10，以 totalExecTime 大到小排序 */
export function getTop10(): Stat[] {
  return [...statMap.values()].sort((a, b) => (b.totalExecTime - a.totalExecTime)).slice(0, 10);
}

