import { setEnqueue } from '@ncf/microkernel';
import { Redis } from 'ioredis';

interface Options {
  redisClient: Redis;
}

/** 根据配置，创建一个 task enqueue 函数，并设置到 microkernel 作为写任务队列的标准函数 */
export function createAndSetEnqueue(opts: Options) {
  const { redisClient } = opts;
  setEnqueue(async (faasPath, request, delay) => {
    redisClient.rpush('taskqueue', JSON.stringify([faasPath, request, delay]));
  });
}
