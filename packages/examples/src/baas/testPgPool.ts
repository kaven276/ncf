/* 需要
 */
import { Pool, PoolClient } from 'pg';
import { asyncLocalStorage } from '@ncf/engine';

declare module "@ncf/engine" {
  interface ICallState {
    pgClient?: PoolClient,
  }
}

type PoolNames = 'test' | 'echarts';

/** 按照名称记录每个已创建的连接池 */
const pools = new Map<PoolNames, Pool>();

/** 根据指定连接池名称获取连接池 */
export function getPGPool(name: PoolNames) {
  let pool = pools.get(name);
  if (!pool) {
    pool = new Pool({
      user: 'echarts',
      host: "127.0.0.1",
      password: "echarts",
      port: 25432,
    });
    pools.set(name, pool);
  }
  return pool;
}

/** 从服务线程中获取指定名称的连接池中的连接 */
export async function getPGPoolByServiceThread(name: PoolNames): Promise<PoolClient> {
  const threadStore = asyncLocalStorage.getStore()!;
  if (!threadStore.pgClient) {
    threadStore.pgClient = await getPGPool(name).connect();
  }
  return threadStore.pgClient!;
}
