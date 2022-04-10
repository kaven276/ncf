import { Pool, PoolConfig } from 'pg';
import { getDebug, resolved } from '@ncf/microkernel';

const debug = getDebug(module);

export function makePgPool(poolConfig: PoolConfig): Pool {
  return resolved(async (addDisposer) => {
    const pool = new Pool(poolConfig);
    addDisposer(async () => pool.end());
    return pool;
  });
}
