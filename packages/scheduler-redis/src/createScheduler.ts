import { Redis } from 'ioredis';
import fetch from 'node-fetch';

interface Options {
  /** redis client，连接到保存任务队列的 redis db */
  redisClient: Redis,
  /** faas 服务的地址 */
  faasUrlHttp: string,
}
let willQuit = false;

/** 根据连接目标配置，对待调度执行的任务取出执行 */
export async function createScheduler(opts: Options) {
  const c = opts.redisClient;
  while (!willQuit) {
    const result = await c.blpop('taskqueue', 1); // timeout 不要太长，1s，这样方便本进程可以快速退出循环，支持快速 graceful shutdown/restart
    if (result) {
      const [key, value] = result;
      const [faasPath, request] = JSON.parse(value);
      console.log([faasPath, request]);
      fetch(opts.faasUrlHttp + faasPath, {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          'content-type': 'application/json'
        },
      });
    }
  }
}

process.once('SIGINT', () => {
  willQuit = true;
});
