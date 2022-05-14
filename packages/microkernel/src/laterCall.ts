// 弱调用，将调用记录到 ctx queue 中
// 等到 executor 执行主体成功后，执行 queue 中弱调用
// 弱调用如果执行成功，则 executor 直接 commit
// 融调用如果执行失败，或者写明异步执行了，则记录队列成功后，executor commit

import { Service, IApi } from './lib/faas';
import { getCallState } from './executor';
import { ICallState } from './lib/callState';
import { request, RequestOptions, Agent } from 'node:http';

/** 可序列化保存到持久化队列(如redis)的任务描述，本质上是 */
export interface LaterTask<T extends IApi = IApi> {
  /** 调用路径 */
  path: T["path"],
  /** 请求 */
  request: T["request"],
  /** dueTime, Date 对应的数字 */
  dueTime?: number,
  /** 第几次重试 */
  retry?: number,
}

interface Enqueue {
  <T extends IApi = IApi>(tasks: LaterTask<T>[]): Promise<void>;
}

/** 给应用代码调用其他 faas 服务使用，对不需要立即同步执行的 faas 调用暂存，等主体事务成功后再处理 */
export function laterCall<T extends Service<IApi>>(faas: T, request: Parameters<T>[0], delay?: number) {
  const ctx = getCallState();
  ctx.laterFaasCalls.push({
    faas,
    request,
    delay,
  });
}

const noneExistEnqueue: Enqueue = async () => {
  throw new Error('没有配置延迟任务推送函数!');
}

let selectedEnqueue: Enqueue = noneExistEnqueue;

/** 设置如何 enqueue */
export function setEnqueue(enqueue: Enqueue) {
  selectedEnqueue = enqueue;
}

/** 设置 http 标准方式(特定的请求配置)来写入待执行任务队列 */
export function setHttpEnqueue(opt: RequestOptions) {
  const agent = new Agent({ keepAlive: true });
  const opt2: RequestOptions = Object.assign({
    agent,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-later': '1',
    }
  }, opt);
  setEnqueue(async (tasks: LaterTask[]) => {
    return new Promise((resolve, reject) => {
      const req = request(opt2);
      req.end(JSON.stringify(tasks.map(t => [t.path, t.request, t.dueTime, t.retry])));
      req.once('response', (resp) => {
        // console.log(resp.statusCode, resp.headers);
        if (resp.statusCode === 200) {
          resolve();
        } else {
          reject();
        }
      });
    });
  });
}

setHttpEnqueue({
  host: '127.0.0.1',
  port: process.env.LATER_PORT || 7999,
});

/** 处理 later faas calls */
export async function processLaterFaasCalls(ctx: ICallState): Promise<void> {
  const tasks: LaterTask[] = [];
  const now = Date.now();
  await Promise.all(ctx.laterFaasCalls.map(async task => {
    if (task.delay === undefined) {
      try {
        // 尝试同步执行，等待结果，如果成功，继续，不成功需要写带持久性支持的可靠队列，如果写队列失败，则整体回滚
        await task.faas(task.request);
        return;
      } catch (e) {
        // 不进入调度执行执行失败的话，要进调度队列
      }
    }
    tasks.push({
      dueTime: now + (task.delay ?? 0),
      path: task.faas.faasPath!,
      request: task.request,
    });
  }));
  // 需要确保写队列，写队列成功后，则认为任务最重将完成
  if (tasks.length > 0) {
    await selectedEnqueue(tasks);
  }
}
