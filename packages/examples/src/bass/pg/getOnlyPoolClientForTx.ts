import { getCallState, getDebug } from '@ncf/microkernel';
import { PoolClient, Pool } from "pg";

const debug = getDebug(module);
const PG_TX = Symbol('PG-TX');

/** 服务调用期间的全部内容 */
declare module '@ncf/microkernel' {
  interface ICallState {
    // 使用 Symbol 作为本功能模块在调用线程数据结构中的 key，防止其他第三方中间件 key 命名重复造成 bug
    [PG_TX]?: Map<Pool, PoolClient>,
  }
}

/** service thread 中需要获取执行名称的链接并开启事务的时候调用，faas thread 中多次引用处于一个事务，faas 结束后自动提交或者回滚。 */
export async function getOnlyPoolClientForTx(pool: Pool): Promise<PoolClient> {
  const threadStore = getCallState();
  // TLS 没有配置 pg 连接的话，就给初始化一个
  /** 持有当前 service thread 中所有 pool 对应的唯一 poolClient */
  let txMap = threadStore[PG_TX];
  if (!txMap) {
    txMap = threadStore[PG_TX] = new Map();
  }
  let poolClient = txMap.get(pool);
  if (poolClient) {
    debug('pg pool client use existing in thread');
    return poolClient;
  }
  // 创建新的链接，并设置事务环境，最后返回 queryRunner
  poolClient = await pool.connect();
  await poolClient.query('BEGIN');
  debug('pg PoolClient start transaction');
  threadStore.trans.push({
    commit: () => {
      debug('pg PoolClient commit');
      poolClient!.query('COMMIT');
      poolClient!.release();
    },
    rollback: () => {
      debug('pg PoolClient rollback');
      poolClient!.query('ROLLBACK');
      poolClient!.release();
    },
  });
  txMap.set(pool, poolClient);
  return poolClient;
}
