// 延时任务执行器
import db, { random } from './db';
import { LaterTaskTuple } from './spec';
import { callApi } from './callApi';

const debug = console.log;

/** 出现失败后，再次需等待的时间间隔(单位秒)；最多在 24H 内再重试 */
const RetryLags = [0, 3, 10, 30, 60, 5 * 60, 15 * 60, 60 * 60, 4 * 60 * 60, 24 * 60 * 60];

/** 上一次 tick 发生的时间 */
export let lastTick: number = Date.now() - 1000 * 3;

/** 遍历 kv store */
const tick = async () => {
  const now = Date.now();
  const last = lastTick;
  lastTick = now; // 新 push 的 task 的计划执行时间至少比本轮时间大于等于，从而被后面轮次 tick 处理
  // todo: 如果当前tick任务过多，可能需要控制并发量，不能同时发出过多的请求
  const tasks: any[] = [];
  //@ts-ignore
  for await (const [key, value] of db.iterator({ gte: String(last), lt: String(now) })) {
    tasks.push([key, value]);
  }
  if (tasks.length === 0) return;
  debug('duetime reached');
  console.dir(tasks, { depth: 7 });
  db.batch(tasks.map(([key]) => ({ type: 'del', key })));
  tasks.map(([key, value]) => {
    const [path, request, dueTime, retry] = value as LaterTaskTuple;
    if (!request) {
      debug('no request！');
    }
    // 取出来的任务都需要放到批处理中删除
    return callApi(path, request).catch((e) => {
      console.error(e)
      const nextRetry = (retry ?? 0) + 1;
      const lag = RetryLags[nextRetry] - RetryLags[nextRetry - 1];
      if (!lag) {
        console.error(`${path} max retry reached, abondon`);
      } else {
        const nextDueTime = dueTime! + lag * 1000;
        // 重新调度，再晚点重新尝试
        db.put(String(nextDueTime) + random(), [path, request, nextDueTime, nextRetry]);
      }
    });
  });
}

let timer: NodeJS.Timer;

/** 启动取到期延迟任务的 interval */
export const start = async () => {
  timer = setInterval(tick, 1000);
  return '已开启到期延迟任务取出执行每秒定时任务';
}

/** 停掉取到期延迟任务的 interval */
export const stop = async () => {
  if (!timer) {
    return '没有设置定时器，无需清理';
  }
  clearInterval(timer);
  return '定时器已清理';
}
