import { asyncLocalStorage, getDebug } from '@ncf/engine';
import { createConnection, getConnection, QueryRunner } from "typeorm";
import { ormconfig } from './ormconfig'

const debug = getDebug(module);

/** 服务调用期间的全部内容 */
declare module '@ncf/engine' {
  interface ICallState {
    db?: {
      [name: string]: QueryRunner,
    },
  }
}

type PoolNames = 'postgis' | 'postgresmac';

// 一旦本模块加载，就立即创建连接池
createConnection(ormconfig.find(c => (c.name === 'postgis'))!).then(() => {
  debug('postgis typeorm connection created');
});

/** service thread 中需要获取执行名称的链接并开启事务的时候调用 */
export async function getConnFromThread(name: PoolNames) {
  const threadStore = asyncLocalStorage.getStore()!;
  if (!threadStore.db) {
    threadStore.db = {};
  }
  if (threadStore.db[name]) {
    return threadStore.db[name];
  }
  const c = getConnection(name);
  const queryRunner = c.createQueryRunner();
  await queryRunner.startTransaction("READ COMMITTED");
  debug('start transaction');
  threadStore.db[name] = queryRunner;
  threadStore.trans.push({
    commit: () => {
      debug('typeorm commit');
      queryRunner.commitTransaction();
    },
    rollback: () => {
      debug('typeorm rollback');
      queryRunner.rollbackTransaction();
    },
  });
  return queryRunner;
}
