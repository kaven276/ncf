import { DataSource, QueryRunner } from 'typeorm';
import { getCallState, getDebug } from '@ncf/microkernel';

const debug = getDebug(module);
const ORMKey = Symbol('ORMKey for tx');

/** 服务调用期间的全部内容 */
declare module '@ncf/microkernel' {
  interface ICallState {
    // 使用 Symbol 作为本功能模块在调用线程数据结构中的 key，防止其他第三方中间件 key 命名重复造成 bug
    [ORMKey]?: Map<DataSource, QueryRunner>,
  }
}

/** service thread 中需要获取执行名称的链接并开启事务的时候调用，faas thread 中多次引用处于一个事务，faas 结束后自动提交或者回滚。 */
export async function getQueryRunnerTx(ds: DataSource): Promise<QueryRunner> {
  const threadStore = getCallState();
  // TLS 没有配置 typeorm 连接的话，就给初始化一个
  /** 持有当前 service thread 中所有 typeorm DataSource 对应的唯一 QueryRunner */
  let txMap = threadStore[ORMKey];
  if (!txMap) {
    txMap = threadStore[ORMKey] = new Map();
  }
  let queryRunner = txMap.get(ds);
  if (queryRunner) {
    debug('query runner use existing in thread');
    return queryRunner;
  }
  // 创建新的链接，并设置事务环境，最后返回 queryRunner
  queryRunner = ds.createQueryRunner();
  threadStore.trans.push({
    commit: async () => {
      debug('typeorm QueryRunner commit');
      await queryRunner!.commitTransaction();
      await queryRunner!.release();
    },
    rollback: async () => {
      debug('typeorm QueryRunner rollback');
      await queryRunner!.rollbackTransaction();
      await queryRunner!.release();
    },
  });
  txMap.set(ds, queryRunner);

  // 最后才执行 await 部分可以防止并发同时取创建重复的连接池，同时确保出现异常的时候能够释放数据是连接资源
  await queryRunner.connect();
  await queryRunner.startTransaction("READ COMMITTED");
  debug('typeorm QueryRunner start transaction', threadStore.trans);
  return queryRunner;
}
