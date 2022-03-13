/* 需要
 */
import { Pool, } from 'pg';
type PoolNames = 'test' | 'echarts';

const pools = new Map<PoolNames, Pool>();

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
