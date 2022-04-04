import { getCallState, getDebug } from '@ncf/microkernel';
import type { PoolClient } from "pg";
import { getPool, getDefaultPoolName } from './config';

export { setPgPoolConfigs, setPgDefaultPoolName, getPool } from './config';
export type { PgPoolConfigMap } from './config';

const debug = getDebug(module);
const PgKey = Symbol('pg pool client key');

/** 服务调用期间的全部内容 */
declare module '@ncf/microkernel' {
  interface ICallState {
    // 使用 Symbol 作为本功能模块在调用线程数据结构中的 key，防止其他第三方中间件 key 命名重复造成 bug
    [PgKey]?: {
      [name: string]: PoolClient,
    },
  }
}

/** service thread 中需要获取执行名称的链接并开启事务的时候调用 */
export async function getConnFromThread(name: string = getDefaultPoolName()): Promise<PoolClient> {
  debug('pool name', name);
  const threadStore = getCallState();

  // TLS 没有配置 typeorm 连接的话，就给初始化一个
  if (!threadStore[PgKey]) {
    debug('init thread local pool map');
    threadStore[PgKey] = {};
  }
  // 如果当前 TLS 中找到指定名称的连接，则直接使用了
  let client: PoolClient | undefined = threadStore[PgKey]![name];
  if (client) {
    debug(`pool ${name} return cached`);
    return client;
  }

  client = await getPool(name).connect();
  threadStore[PgKey]![name] = client;
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
  await client.query('BEGIN');
  return client;
}
