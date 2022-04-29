import Redis, { RedisOptions } from 'ioredis';
import { getDebug, resolved } from '@ncf/microkernel';

const debug = getDebug(module);

/** 根据连接池配置，可以创建一个管理器对象，用于 NCF 创建和初始化连接池还有注册关闭连接池函数 */
export function makeRedisClient(path?: string, opts?: RedisOptions): Redis {
  return resolved(async addDisposer => {
    const client = opts ? new Redis(path!, opts) : (path ? new Redis(path) : new Redis());
    addDisposer(async () => client.disconnect())
    return client;
  });
}
