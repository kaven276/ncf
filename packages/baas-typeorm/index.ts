import "reflect-metadata";
import { getCallState, getDebug } from '@ncf/microkernel';
import { QueryRunner } from "typeorm";
import { getConnection, getDefaultPoolName } from './config';

export { setTypeormConnectionConfigs, getConnection, setTypeormDefaultPoolName } from './config';

const debug = getDebug(module);
const ORMKey = Symbol.for('ORMKey');

/** 服务调用期间的全部内容 */
declare module '@ncf/microkernel' {
  interface ICallState {
    // 使用 Symbol 作为本功能模块在调用线程数据结构中的 key，防止其他第三方中间件 key 命名重复造成 bug
    [ORMKey]?: {
      [name: string]: QueryRunner,
    },
  }
}

/** service thread 中需要获取执行名称的链接并开启事务的时候调用 */
export async function getConnFromThread(name: string = getDefaultPoolName()): Promise<QueryRunner> {
  const threadStore = getCallState();
  // TLS 没有配置 typeorm 连接的话，就给初始化一个
  if (!threadStore[ORMKey]) {
    threadStore[ORMKey] = {};
  }
  // 如果当前 TLS 中找到指定名称的连接，则直接使用了
  if (threadStore[ORMKey]![name]) {
    return threadStore[ORMKey]![name];
  }

  // 创建新的链接，并设置事务环境，最后返回 queryRunner
  const c = await getConnection(name);

  const queryRunner = c.createQueryRunner();
  await queryRunner.startTransaction("READ COMMITTED");
  debug('start transaction');
  threadStore[ORMKey]![name] = queryRunner;
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

