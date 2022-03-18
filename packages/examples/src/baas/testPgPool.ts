/* 需要
 */
import { Pool, PoolClient } from 'pg';
import { getCallState, getDebug, getConfig } from '@ncf/engine';

const debug = getDebug(module);

declare module "@ncf/engine" {

  interface ICallState {
    pgClient?: PoolClient,
  }

  interface IConfig {
    /** 连接池名称 */
    pool?: string,
  }

}

type PoolNames = 'test' | 'echarts';

/** 按照名称记录每个已创建的连接池 */
const pools = new Map<PoolNames, Pool>();

/** 根据指定连接池名称获取连接池 */
export function getPGPool(name: PoolNames) {
  debug('pool name', name);
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
export async function getPGPoolByServiceThread(name?: PoolNames): Promise<PoolClient> {
  const poolName = name || (await getConfig('pool')) as PoolNames;
  debug('pool name', poolName);
  const threadStore = getCallState();
  let client = threadStore.pgClient;
  if (!client) {
    client = threadStore.pgClient = await getPGPool(poolName).connect();
    threadStore.trans.push({
      commit: () => {
        debug('pg commit');
        client!.query('COMMIT');
        client!.release();
      },
      rollback: () => {
        debug('pg rollback');
        client!.query('ROLLBACK');
        client!.release();
      },
    });
  }
  await client.query('BEGIN');
  return client;
}
