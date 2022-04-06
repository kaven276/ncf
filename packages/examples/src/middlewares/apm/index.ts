import { getDebug, IMiddleWare } from '@ncf/microkernel';

const debug = getDebug(module);

type FaasPath = string;

/** 使用 class 而非 interface 原因是可能因标记统一的类型有利于 v8 优化 */
class Stat {
  constructor(
    public path: FaasPath,
    /** 执行次数 */
    public times: number,
    /** 最大执行时长, 单位 ms */
    public maxExecTime: number,
    /** 总累计执行时长, 单位 ms */
    public totalExecTime: number,
    /** 首次记录时间点, Date.now() */
    public firstExecTime: number,
  ) { }
}
const statMap = new Map<FaasPath, Stat>();

/** 采集服务调用性能数据的中间件 */
export const collectTimes: IMiddleWare = async (ctx, next) => {
  const startTime = Date.now();
  let stat = statMap.get(ctx.path);
  if (!stat) {
    stat = new Stat(ctx.path, 0, 0, 0, startTime);
    statMap.set(stat.path, stat);
  }
  await next();
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
