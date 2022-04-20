// 弱调用，将调用记录到 ctx queue 中
// 等到 executor 执行主体成功后，执行 queue 中弱调用
// 弱调用如果执行成功，则 executor 直接 commit
// 融调用如果执行失败，或者写明异步执行了，则记录队列成功后，executor commit

import { Service, IApi } from './lib/faas';
import { getCallState } from './executor';
import { ICallState } from './lib/callState';

interface Enqueue<T extends IApi> {
  (faasPath: string, request: any, delay?: number): Promise<void>;
}

/** 可序列化保存到持久化队列(如redis)的任务描述，本质上是 */
class Task {
  constructor(
    public faasPath: string,
    public request: string,
    public delay?: number,
  ) { }
}

/** 给应用代码调用其他 faas 服务使用，对不需要立即同步执行的 faas 调用暂存，等主体事务成功后再处理 */
export function laterCall<T extends IApi>(faas: Service<T>, request: T["request"], delay?: number) {
  const ctx = getCallState();
  ctx.laterFaasCalls.push({
    faas,
    request,
    delay,
  });
}

const queue = new Array<Task>();
const localEnqueue: Enqueue<IApi> = async (faasPath, request, delay?) => {
  queue.push(new Task(faasPath, request, delay));
}

let selectedEnqueue: Enqueue<IApi> = localEnqueue;

/** 设置如何 enqueue */
export function setEnqueue(enqueue: Enqueue<IApi>) {
  selectedEnqueue = enqueue;
}


/** 处理 later faas calls */
export async function processLaterFaasCalls(ctx: ICallState): Promise<void> {
  const tasks = Promise.all(ctx.laterFaasCalls.map(async task => {
    if (task.delay === undefined) {
      try {
        // 尝试同步执行，等待结果，如果成功，继续，不成功需要写带持久性支持的可靠队列，如果写队列失败，则整体回滚
        await task.faas(task.request);
        return;
      } catch (e) {
        // 不进入调度执行执行失败的话，要进调度队列
      }
    }
    // 需要确保写队列，写队列成功后，则认为任务最重将完成
    await selectedEnqueue(task.faas.faasPath!, task.request, task.delay);
  }));
  await tasks;
}
