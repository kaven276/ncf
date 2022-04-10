import { Pool, PoolConfig } from 'pg';
import { getDebug, resolved } from '@ncf/microkernel';
import { getOnlyPoolClientForTx } from './getOnlyPoolClientForTx';

const debug = getDebug(module);

declare module 'pg' {
  interface Pool {
    getClientTx: () => Promise<PoolClient>,
  }
}

export function makePgPool(poolConfig: PoolConfig): Pool {
  return resolved(async (addDisposer) => {
    const pool = new Pool(poolConfig);
    addDisposer(async () => pool.end());
    pool.getClientTx = () => getOnlyPoolClientForTx(pool);
    return pool;
  });
}
